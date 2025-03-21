import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NavBar from "@/components/layout/NavBar";
import { useUser } from "@clerk/clerk-react";
import { bookShipment, cancelBooking } from "@/services/bookingService";
import GooglePlacesAutocomplete from "@/components/inputs/GooglePlacesAutocomplete";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Briefcase, ChevronRight, Download, MapPin, Package, ShoppingCart, Truck, User } from "lucide-react";
import { getBookingByTrackingCode } from "@/services/bookingDb";
import LabelLanguageSelector from "@/components/labels/LabelLanguageSelector";
import { generateLabel } from "@/services/labelService";
import { getCountryFlag, getCountryName } from "@/lib/utils";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

type CustomerType = "business" | "private" | "ecommerce" | null;

interface ShipmentBookingPageProps {
  customerType?: CustomerType;
}

const ShipmentBookingPage = ({ customerType }: ShipmentBookingPageProps) => {
  const { isSignedIn, user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Shipment details
  const [weight, setWeight] = useState("5");
  const [length, setLength] = useState("20");
  const [width, setWidth] = useState("15");
  const [height, setHeight] = useState("10");
  const [packageType, setPackageType] = useState("package");
  const [quantity, setQuantity] = useState("1");
  
  // Step 1: Basic details
  const [pickup, setPickup] = useState("Stockholm, SE");
  const [pickupPostalCode, setPickupPostalCode] = useState("112 23");
  const [delivery, setDelivery] = useState("Helsinki, FI");
  const [deliveryPostalCode, setDeliveryPostalCode] = useState("00341");
  const [pickupCountry, setPickupCountry] = useState("SE");
  const [deliveryCountry, setDeliveryCountry] = useState("FI");
  
  // Step 2: Service selection
  const [deliverySpeed, setDeliverySpeed] = useState("standard");
  
  // Step 3: Address details
  const [senderName, setSenderName] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [senderAddress2, setSenderAddress2] = useState("");
  const [senderCity, setSenderCity] = useState("Stockholm");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPersonalId, setSenderPersonalId] = useState("");
  
  const [recipientName, setRecipientName] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientCity, setRecipientCity] = useState("HELSINKI");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  
  // Other state
  const [compliance, setCompliance] = useState(false);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [selectedCustomerType, setSelectedCustomerType] = useState<CustomerType>(customerType || null);
  const [businessName, setBusinessName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [canCancelBooking, setCanCancelBooking] = useState(false);
  const [labelLanguage, setLabelLanguage] = useState("en");
  const [isGeneratingLabel, setIsGeneratingLabel] = useState(false);
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  useEffect(() => {
    const checkSavedBooking = async () => {
      if (isSignedIn && user) {
        const savedBookingInfo = localStorage.getItem('lastBooking');
        
        if (savedBookingInfo) {
          const { trackingCode, timestamp } = JSON.parse(savedBookingInfo);
          
          const bookingData = await getBookingByTrackingCode(trackingCode, user.id);
          
          if (bookingData) {
            setBookingResult(bookingData);
            setBookingConfirmed(true);
            
            const cancellationDeadline = new Date(bookingData.cancellation_deadline);
            const now = new Date();
            
            if (now < cancellationDeadline) {
              setCanCancelBooking(true);
            } else {
              localStorage.removeItem('lastBooking');
              setCanCancelBooking(false);
            }
          } else {
            localStorage.removeItem('lastBooking');
          }
        }
      }
    };
    
    checkSavedBooking();
  }, [isSignedIn, user]);

  const showCustomerTypeSelection = !selectedCustomerType && location.pathname === "/shipment";

  useEffect(() => {
    if (customerType) {
      setSelectedCustomerType(customerType);
    }
  }, [customerType]);

  const getCarrierPrice = () => {
    switch (selectedCustomerType) {
      case "business": return 9;
      case "ecommerce": return 8;
      default: return 10;
    }
  };

  const carrier = {
    id: 1,
    name: "E-Parcel Nordic",
    price: getCarrierPrice(),
    eta: "3 days",
    icon: "📦"
  };

  const handleCustomerTypeSelect = (type: CustomerType) => {
    if (type) {
      navigate(`/shipment/${type}`);
    }
  };
  
  const handleBookNow = async () => {
    if (!isSignedIn || !user) {
      document.querySelector<HTMLButtonElement>("button.cl-userButtonTrigger")?.click();
      return;
    }

    setIsBooking(true);
    
    try {
      const result = await bookShipment({
        weight,
        dimensions: { length, width, height },
        pickup,
        delivery,
        carrier: { name: carrier.name, price: carrier.price },
        deliverySpeed,
        includeCompliance: compliance,
        userId: user.id,
        customerType: selectedCustomerType || "private",
        businessName: selectedCustomerType === "business" || selectedCustomerType === "ecommerce" ? businessName : undefined,
        vatNumber: selectedCustomerType === "business" ? vatNumber : undefined,
        senderDetails: {
          name: senderName,
          address: senderAddress,
          postalCode: pickupPostalCode,
          city: senderCity,
          country: pickupCountry,
          phone: senderPhone,
          email: senderEmail
        },
        recipientDetails: {
          name: recipientName,
          address: recipientAddress,
          postalCode: deliveryPostalCode,
          city: recipientCity,
          country: deliveryCountry,
          phone: recipientPhone,
          email: recipientEmail
        }
      });
      
      if (result.success) {
        setBookingResult(result);
        setBookingConfirmed(true);
        setCanCancelBooking(true);
        
        localStorage.setItem('lastBooking', JSON.stringify({
          trackingCode: result.trackingCode,
          timestamp: new Date().toISOString()
        }));
        
        toast({
          title: "Shipment Booked",
          description: `Your shipment has been booked with tracking code: ${result.trackingCode}`,
        });
      } else {
        toast({
          title: "Booking Failed",
          description: result.message || "There was a problem with your booking.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in booking flow:", error);
      toast({
        title: "Booking Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingResult?.trackingCode && !bookingResult?.tracking_code) return;
    
    const trackingCode = bookingResult.trackingCode || bookingResult.tracking_code;
    
    if (!trackingCode || !user?.id) return;
    
    try {
      const cancelled = await cancelBooking(trackingCode, user.id);
      if (cancelled) {
        setBookingConfirmed(false);
        setBookingResult(null);
        setCanCancelBooking(false);
        localStorage.removeItem('lastBooking');
        
        toast({
          title: "Booking Cancelled",
          description: "Your booking has been successfully cancelled.",
        });
      } else {
        toast({
          title: "Cancellation Failed",
          description: "Unable to cancel booking. Please try again or contact support.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Cancellation Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleSwapLocations = () => {
    const tempPickup = pickup;
    const tempPickupPostal = pickupPostalCode;
    const tempPickupCountry = pickupCountry;
    
    setPickup(delivery);
    setPickupPostalCode(deliveryPostalCode);
    setPickupCountry(deliveryCountry);
    
    setDelivery(tempPickup);
    setDeliveryPostalCode(tempPickupPostal);
    setDeliveryCountry(tempPickupCountry);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleBookNow();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const createTestBooking = () => {
    if (!isSignedIn || !user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to create a test booking.",
        variant: "destructive",
      });
      return;
    }

    setWeight("5");
    setLength("20");
    setWidth("15");
    setHeight("10");
    setPickup("Stockholm, SE");
    setDelivery("Helsinki, FI");
    setShowBookingConfirmation(true);
    handleBookNow();
  };

  const handleGenerateLabel = async () => {
    if (!bookingResult) return;
    
    const trackingCode = bookingResult.trackingCode || bookingResult.tracking_code;
    const shipmentId = bookingResult.shipmentId || "SHIP-" + Math.floor(Math.random() * 1000000);
    
    if (!trackingCode) {
      toast({
        title: "Error",
        description: "Unable to generate label: missing tracking code",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingLabel(true);
    
    try {
      const dimensions = `${length}x${width}x${height} cm`;
      const result = await generateLabel({
        shipmentId,
        carrierName: bookingResult.carrier_name || "E-Parcel Nordic",
        trackingCode,
        senderAddress: pickup,
        recipientAddress: delivery,
        packageDetails: {
          weight: weight,
          dimensions: dimensions
        },
        language: labelLanguage
      });
      
      if (result.success) {
        if (!bookingResult.labelUrl) {
          setBookingResult({
            ...bookingResult,
            labelUrl: result.labelUrl
          });
        }
        
        window.open(result.labelUrl, '_blank');
        
        toast({
          title: "Label Generated",
          description: `Label has been generated in ${labelLanguage === 'en' ? 'English' : 
                        labelLanguage === 'fi' ? 'Finnish' : 
                        labelLanguage === 'sv' ? 'Swedish' : 
                        labelLanguage === 'no' ? 'Norwegian' : 'Danish'}`,
        });
      } else {
        toast({
          title: "Label Generation Failed",
          description: result.message || "Unable to generate shipping label",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating label:", error);
      toast({
        title: "Label Generation Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLabel(false);
    }
  };

  // Render progress steps indicator
  const renderStepIndicator = () => {
    return (
      <div className="flex items-center gap-4 mb-8">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isPast = currentStep > stepNumber;
          
          return (
            <div key={stepNumber} className="flex items-center gap-4">
              {stepNumber > 1 && <div className="flex-1 h-px bg-border"></div>}
              
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isActive || isPast ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <span className="text-xs font-bold">{stepNumber}</span>
              </div>
              
              <span className={`text-sm ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {stepNumber === 1 && "Grundläggande detaljer"}
                {stepNumber === 2 && "Välj tjänst"}
                {stepNumber === 3 && "Adress"}
                {stepNumber === 4 && "Innehåll och referens"}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (showCustomerTypeSelection) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />

        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-center mb-8">Select Customer Type</h1>
          
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleCustomerTypeSelect("business")}
            >
              <CardHeader className="flex flex-col items-center">
                <Briefcase className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Business</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  For registered businesses shipping commercial goods
                </p>
                <p className="text-sm font-medium text-primary">€9 base rate</p>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleCustomerTypeSelect("private")}
            >
              <CardHeader className="flex flex-col items-center">
                <User className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Private Customer</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  For individuals shipping personal items
                </p>
                <p className="text-sm font-medium text-primary">€10 base rate</p>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleCustomerTypeSelect("ecommerce")}
            >
              <CardHeader className="flex flex-col items-center">
                <ShoppingCart className="h-12 w-12 text-primary mb-2" />
                <CardTitle>E-commerce Business</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  For online retailers with regular shipments
                </p>
                <p className="text-sm font-medium text-primary">€8 base rate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                Booking Confirmed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h2 className="text-xl font-semibold text-green-800 mb-4">Your shipment is booked!</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Tracking Code</p>
                    <p className="text-lg font-mono font-medium">{bookingResult?.trackingCode || bookingResult?.tracking_code}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Carrier</p>
                    <p className="text-lg font-medium">{bookingResult?.carrier_name || carrier.name}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Total Price</p>
                    <p className="text-lg font-medium">€{bookingResult?.totalPrice || bookingResult?.total_price}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Estimated Delivery</p>
                    <p className="text-lg font-medium">{carrier.eta}</p>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-green-200 pt-6">
                  <h3 className="font-medium mb-2">Shipping Label</h3>
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <LabelLanguageSelector 
                        value={labelLanguage}
                        onChange={setLabelLanguage}
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={handleGenerateLabel}
                      disabled={isGeneratingLabel}
                    >
                      <Download className="h-4 w-4" />
                      {isGeneratingLabel ? "Generating..." : "Generate & Download Label"}
                    </Button>
                  </div>
                </div>
              </div>
              
              {canCancelBooking && (
                <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                  <h3 className="font-medium text-amber-800 mb-2">Need to cancel?</h3>
                  <p className="text-sm text-amber-700 mb-4">
                    You can cancel this booking until:
                    <span className="font-medium block">
                      {new Date(bookingResult.cancellationDeadline || bookingResult.cancellation_deadline).toLocaleString()}
                    </span>
                  </p>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleCancelBooking}
                  >
                    Cancel Booking
                  </Button>
                </div>
              )}
              
              <div className="flex justify-between gap-4 pt-4">
                <Button
                  variant="outline"
                  asChild
                >
                  <Link to="/dashboard">View All Shipments</Link>
                </Button>
                <Button
                  onClick={() => {
                    setBookingConfirmed(false);
                    setBookingResult(null);
                    localStorage.removeItem('lastBooking');
                    navigate('/shipment');
                  }}
                >
                  Book Another Shipment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {renderStepIndicator()}
          
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="mb-8">
                <ResizablePanelGroup direction="horizontal" className="min-h-[200px] rounded-lg border">
                  <ResizablePanel defaultSize={50}>
                    <div className="p-0">
                      <div className="bg-slate-700 text-white p-3 font-semibold">
                        Från
                      </div>
                      
                      <div className="p-4 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="fromCountry">Land</Label>
                          <div className="relative">
                            <select
                              id="fromCountry"
                              className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background appearance-none cursor-pointer"
                              value={pickupCountry}
                              onChange={(e) => setPickupCountry(e.target.value)}
                            >
                              <option value="SE">Sverige</option>
                              <option value="FI">Finland</option>
                              <option value="NO">Norge</option>
                              <option value="DK">Danmark</option>
                            </select>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                              {getCountryFlag(pickupCountry)}
                            </div>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="fromPostal">Postnummer</Label>
                          <Input
                            id="fromPostal"
                            placeholder="Enter postal code"
                            value={pickupPostalCode}
                            onChange={(e) => setPickupPostalCode(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            {pickupPostalCode}, Stockholm
                          </p>
                        </div>
                        
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="fromCompany"
                              name="fromType"
                              className="h-4 w-4 rounded-full border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="fromCompany">Företag</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="fromPrivate"
                              name="fromType"
                              className="h-4 w-4 rounded-full border-gray-300 text-primary focus:ring-primary"
                              defaultChecked
                            />
                            <Label htmlFor="fromPrivate">Privatperson</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ResizablePanel>
                  
                  <ResizableHandle withHandle>
                    <div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-200 hover:bg-slate-300 cursor-pointer z-10"
                      onClick={handleSwapLocations}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 16L3 12M3 12L7 8M3 12H21M17 8L21 12M21 12L17 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </ResizableHandle>
                  
                  <ResizablePanel defaultSize={50}>
                    <div className="p-0">
                      <div className="bg-slate-700 text-white p-3 font-semibold">
                        Till
                      </div>
                      
                      <div className="p-4 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="toCountry">Land</Label>
                          <div className="relative">
                            <select
                              id="toCountry"
                              className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background appearance-none cursor-pointer"
                              value={deliveryCountry}
                              onChange={(e) => setDeliveryCountry(e.target.value)}
                            >
                              <option value="SE">Sverige</option>
                              <option value="FI">Finland</option>
                              <option value="NO">Norge</option>
                              <option value="DK">Danmark</option>
                            </select>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                              {getCountryFlag(deliveryCountry)}
                            </div>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="toPostal">Postnummer</Label>
                          <Input
                            id="toPostal"
                            placeholder="Enter postal code"
                            value={deliveryPostalCode}
                            onChange={(e) => setDeliveryPostalCode(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            {deliveryPostalCode}, Helsinki
                          </p>
                        </div>
                        
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="toCompany"
                              name="toType"
                              className="h-4 w-4 rounded-full border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="toCompany">Företag</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="toPrivate"
                              name="toType"
                              className="h-4 w-4 rounded-full border-gray-300 text-primary focus:ring-primary"
                              defaultChecked
                            />
                            <Label htmlFor="toPrivate">Privatperson</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
                
                <div className="border rounded-lg mt-4">
                  <div className="bg-slate-700 text-white p-3 font-semibold">
                    Ange sändningsdetaljer
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                      <div>
                        <Label htmlFor="quantity" className="block mb-2">Antal</Label>
                        <div className="relative">
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="text-center"
                          />
                          <div className="absolute inset-y-0 right-0 flex flex-col">
                            <button 
                              type="button" 
                              className="flex-1 px-2 bg-slate-100 border-l border-b border-input hover:bg-slate-200"
                              onClick={() => setQuantity((parseInt(quantity) + 1).toString())}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 5L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M5 12L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button 
                              type="button" 
                              className="flex-1 px-2 bg-slate-100 border-l border-input hover:bg-slate-200"
                              onClick={() => setQuantity(Math.max(1, parseInt(quantity) - 1).toString())}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="packageType" className="block mb-2">Vad skickar du</Label>
                        <div className="relative">
                          <select
                            id="packageType"
                            className="w-full h-10 pl-3 pr-10 rounded-md border border-input bg-background appearance-none"
                            value={packageType}
                            onChange={(e) => setPackageType(e.target.value)}
                          >
                            <option value="package">Paket</option>
                            <option value="document">Dokument</option>
                            <option value="pallet">Pall</option>
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="length" className="block mb-2">Längd</Label>
                        <Input
                          id="length"
                          type="number"
                          min="1"
                          value={length}
                          onChange={(e) => setLength(e.target.value)}
                          postfix="cm"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="width" className="block mb-2">Bredd</Label>
                        <Input
                          id="width"
                          type="number"
                          min="1"
                          value={width}
                          onChange={(e) => setWidth(e.target.value)}
                          postfix="cm"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="height" className="block mb-2">Höjd</Label>
                        <Input
                          id="height"
                          type="number"
                          min="1"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          postfix="cm"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="weight" className="block mb-2">Vikt</Label>
                        <Input
                          id="weight"
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          postfix="kg"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => {}}
                      >
                        <Package className="h-4 w-4" />
                        Lägg till kolli
                      </Button>
                      
                      <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                      >
                        Fortsätt
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="mb-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-slate-700 text-white p-3 font-semibold">
                      Från
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="senderName" className="text-sm font-medium">
                          Avsändare <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="senderName" 
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          placeholder="Namn på avsändare"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="senderAddress" className="text-sm font-medium">
                          Gatuadress <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="senderAddress" 
                          value={senderAddress}
                          onChange={(e) => setSenderAddress(e.target.value)}
                          placeholder="Gatuadress"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="senderAddress2" className="text-sm font-medium">
                          Gatuadress 2
                        </Label>
                        <Input 
                          id="senderAddress2" 
                          value={senderAddress2}
                          onChange={(e) => setSenderAddress2(e.target.value)}
                          placeholder="Lägenhetsnummer, etc. (valfritt)"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="senderPostal" className="text-sm font-medium">
                          Postnummer <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="senderPostal" 
                          value={pickupPostalCode}
                          onChange={(e) => setPickupPostalCode(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="senderCity" className="text-sm font-medium">
                          Ort <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="senderCity" 
                          value={senderCity}
                          onChange={(e) => setSenderCity(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="senderCountry" className="text-sm font-medium">
                          Land <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <select
                            id="senderCountry"
                            className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background appearance-none cursor-pointer"
                            value={pickupCountry}
                            onChange={(e) => setPickupCountry(e.target.value)}
                            required
                          >
                            <option value="SE">Sverige</option>
                            <option value="FI">Finland</option>
                            <option value="NO">Norge</option>
                            <option value="DK">Danmark</option>
                          </select>
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            {getCountryFlag(pickupCountry)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="senderPhone" className="text-sm font-medium">
                          Mobil-/Telefonnummer <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex">
                          <div className="flex items-center border border-r-0 border-input rounded-l-md px-3 bg-muted">
                            {getCountryFlag(pickupCountry)}
                            <span className="ml-1 text-sm text-muted-foreground">+46</span>
                          </div>
                          <Input 
                            id="senderPhone" 
                            value={senderPhone}
                            onChange={(e) => setSenderPhone(e.target.value)}
                            className="rounded-l-none"
                            placeholder="123456789"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="senderEmail" className="text-sm font-medium">
                          Betalarens e-postadress <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="senderEmail" 
                          type="email"
                          value={senderEmail}
                          onChange={(e) => setSenderEmail(e.target.value)}
                          placeholder="example@example.com"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="senderPersonalId" className="text-sm font-medium">
                          Personnummer <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="senderPersonalId" 
                          value={senderPersonalId}
                          onChange={(e) => setSenderPersonalId(e.target.value)}
                          placeholder="ÅÅMMDD-XXXX"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-slate-700 text-white p-3 font-semibold">
                      Till
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="recipientName" className="text-sm font-medium">
                          Mottagare <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="recipientName" 
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          placeholder="Namn på mottagare"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="recipientAddress" className="text-sm font-medium">
                          Gatuadress <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="recipientAddress" 
                          value={recipientAddress}
                          onChange={(e) => setRecipientAddress(e.target.value)}
                          placeholder="Gatuadress"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="recipientPostal" className="text-sm font-medium">
                          Postnummer <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="recipientPostal" 
                          value={deliveryPostalCode}
                          onChange={(e) => setDeliveryPostalCode(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="recipientCity" className="text-sm font-medium">
                          Ort <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="recipientCity" 
                          value={recipientCity}
                          onChange={(e) => setRecipientCity(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="recipientCountry" className="text-sm font-medium">
                          Land <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <select
                            id="recipientCountry"
                            className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background appearance-none cursor-pointer"
                            value={deliveryCountry}
                            onChange={(e) => setDeliveryCountry(e.target.value)}
                            required
                          >
                            <option value="SE">Sverige</option>
                            <option value="FI">Finland</option>
                            <option value="NO">Norge</option>
                            <option value="DK">Danmark</option>
                          </select>
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            {getCountryFlag(deliveryCountry)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="recipientPhone" className="text-sm font-medium">
                          Mobil-/Telefonnummer <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex">
                          <div className="flex items-center border border-r-0 border-input rounded-l-md px-3 bg-muted">
                            {getCountryFlag(deliveryCountry)}
                            <span className="ml-1 text-sm text-muted-foreground">+358</span>
                          </div>
                          <Input 
                            id="recipientPhone" 
                            value={recipientPhone}
                            onChange={(e) => setRecipientPhone(e.target.value)}
                            className="rounded-l-none"
                            placeholder="123456789"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="recipientEmail" className="text-sm font-medium">
                          Epost
                        </Label>
                        <Input 
                          id="recipientEmail" 
                          type="email"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          placeholder="example@example.com"
                        />
                        <p className="text-xs text-muted-foreground">
                          Mottagaren får ej avisering om e-post saknas
                        </p>
                      </div>
                      
                      <div className="pt-4">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          className="flex items-center gap-1 text-primary"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5L12 19M5 12L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Tilläggsuppgifter/transportanvisningar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-6 rounded-lg border mt-8">
                  <h3 className="text-lg font-medium mb-4">Sammanfattning</h3>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-slate-200 p-3 rounded-md">
                      <MapPin className="h-6 w-6 text-slate-700" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 flex-1">
                      <div>
                        <p className="font-medium">Från</p>
                        <p>{pickupPostalCode}</p>
                        <p>Stockholm</p>
                        <p>{getCountryName(pickupCountry)}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium">Till</p>
                        <p>{deliveryPostalCode}</p>
                        <p>Helsinki</p>
                        <p>{getCountryName(deliveryCountry)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                      <div>
                        <p className="font-medium">Paket</p>
                        <p>1xPaket {length}x{width}x{height}cm - {weight} kg</p>
                      </div>
                      
                      <div>
                        <p className="font-medium">Välj tjänst</p>
                        <p>DHL Parcel Connect</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-12 text-sm">
                      <div className="col-span-8 text-muted-foreground">Pris moms 0%:</div>
                      <div className="col-span-4 text-right">210.96 kr</div>
                      
                      <div className="col-span-8 text-muted-foreground">MOMS 25%:</div>
                      <div className="col-span-4 text-right">52.74 kr</div>
                      
                      <div className="col-span-8 font-medium pt-2">Totalpris:</div>
                      <div className="col-span-4 text-right font-medium pt-2">263.70 kr</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                  >
                    Tillbaka
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Fortsätt
                  </Button>
                </div>
              </div>
            )}
            
            {currentStep !== 1 && currentStep !== 3 && (
              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                >
                  Tillbaka
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {currentStep === totalSteps ? "Slutför bokning" : "Fortsätt"}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShipmentBookingPage;
