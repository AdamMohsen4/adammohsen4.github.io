
import { toast } from "@/components/ui/use-toast";
import { generateLabel } from "./labelService";
import { schedulePickup } from "./pickupService";
import { saveShipment } from "./shipmentService";
import { BookingRequest, BookingResponse } from "@/types/booking";
import { calculateTotalPrice, calculateEstimatedDelivery, generateShipmentId, generateTrackingCode } from "./bookingUtils";
import { saveBookingToSupabase } from "./bookingDb";

export type { BookingRequest, BookingResponse };

export const bookShipment = async (request: BookingRequest): Promise<BookingResponse> => {
  try {
    console.log("Booking shipment with request:", request);
    
    // Generate IDs
    const shipmentId = generateShipmentId();
    const trackingCode = generateTrackingCode();
    
    // Step 1: Generate label
    const labelResult = await generateLabel({
      shipmentId,
      carrierName: request.carrier.name,
      trackingCode,
      senderAddress: request.pickup,
      recipientAddress: request.delivery,
      packageDetails: {
        weight: request.weight,
        dimensions: `${request.dimensions.length}x${request.dimensions.width}x${request.dimensions.height} cm`
      }
    });
    
    if (!labelResult.success) {
      return {
        success: false,
        message: "Failed to generate shipping label"
      };
    }
    
    // Step 2: Schedule pickup
    const pickupResult = await schedulePickup({
      shipmentId,
      carrierName: request.carrier.name,
      pickupAddress: request.pickup,
      slotId: request.pickupSlotId
    });
    
    if (!pickupResult.confirmed) {
      return {
        success: false,
        message: "Failed to schedule pickup"
      };
    }
    
    // Calculate total price and delivery date
    const totalPrice = calculateTotalPrice(request.carrier.price, request.includeCompliance);
    const estimatedDelivery = calculateEstimatedDelivery(request.deliverySpeed);
    
    // Step 3: Save the booking to Supabase
    console.log("Attempting to save booking to Supabase with userId:", request.userId);
    const supabaseSaveSuccess = await saveBookingToSupabase(
      request,
      trackingCode,
      labelResult.labelUrl,
      pickupResult.pickupTime!,
      totalPrice,
      estimatedDelivery
    );
    
    // If Supabase save fails, fall back to local storage
    if (!supabaseSaveSuccess) {
      console.error("Supabase save failed, falling back to local storage");
      toast({
        title: "Database Save Warning",
        description: "Could not save to primary database, using backup storage instead.",
        // Changed from "warning" to "destructive" as that's a valid variant
        variant: "destructive",
      });
      
      const shipmentData = await saveShipment({
        userId: request.userId,
        trackingCode,
        carrier: request.carrier,
        weight: request.weight,
        dimensions: request.dimensions,
        pickup: request.pickup,
        delivery: request.delivery,
        deliverySpeed: request.deliverySpeed,
        includeCompliance: request.includeCompliance,
        labelUrl: labelResult.labelUrl,
        pickupTime: pickupResult.pickupTime,
        totalPrice,
        status: 'pending',
        estimatedDelivery
      });
      
      if (!shipmentData) {
        return {
          success: false,
          message: "Failed to save shipment data"
        };
      }
    } else {
      console.log("Successfully saved booking to Supabase");
      toast({
        title: "Booking Saved",
        description: "Your shipment has been successfully recorded in our database.",
      });
    }
    
    // Return the combined result
    return {
      success: true,
      shipmentId,
      trackingCode,
      labelUrl: labelResult.labelUrl,
      pickupTime: pickupResult.pickupTime,
      totalPrice
    };
    
  } catch (error) {
    console.error("Error booking shipment:", error);
    toast({
      title: "Booking Failed",
      description: "There was a problem processing your booking. Please try again.",
      variant: "destructive",
    });
    return {
      success: false,
      message: "An unexpected error occurred"
    };
  }
};
