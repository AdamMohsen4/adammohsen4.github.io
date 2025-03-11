
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { updateShipmentStatus } from "@/services/shipmentService";

export interface AdminStats {
  totalShipments: number;
  pendingShipments: number;
  completedShipments: number;
  totalDemoRequests: number;
  totalCollaborations: number;
  totalSupportTickets: number;
  openSupportTickets: number;
}

export const loadStats = async (): Promise<AdminStats> => {
  try {
    const { count: totalCount, error: totalError } = await supabase
      .from('booking')
      .select('*', { count: 'exact', head: true });
    
    const { count: pendingCount, error: pendingError } = await supabase
      .from('booking')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'picked_up', 'in_transit']);
    
    const { count: completedCount, error: completedError } = await supabase
      .from('booking')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'delivered');
      
    const { count: demoCount, error: demoError } = await supabase
      .from('demo_requests')
      .select('*', { count: 'exact', head: true });
      
    const { count: collabCount, error: collabError } = await supabase
      .from('collaborations')
      .select('*', { count: 'exact', head: true });
    
    const { count: supportCount, error: supportError } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true });
    
    const { count: openSupportCount, error: openSupportError } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');
    
    if (!totalError && !pendingError && !completedError && !demoError && 
        !collabError && !supportError && !openSupportError) {
      return {
        totalShipments: totalCount || 0,
        pendingShipments: pendingCount || 0,
        completedShipments: completedCount || 0,
        totalDemoRequests: demoCount || 0,
        totalCollaborations: collabCount || 0,
        totalSupportTickets: supportCount || 0,
        openSupportTickets: openSupportCount || 0
      };
    } else {
      console.error("Error fetching stats:", { 
        totalError, pendingError, completedError, demoError, collabError, supportError, openSupportError
      });
      return {
        totalShipments: 0,
        pendingShipments: 0,
        completedShipments: 0,
        totalDemoRequests: 0,
        totalCollaborations: 0,
        totalSupportTickets: 0,
        openSupportTickets: 0
      };
    }
  } catch (error) {
    console.error("Error loading stats:", error);
    return {
      totalShipments: 0,
      pendingShipments: 0,
      completedShipments: 0,
      totalDemoRequests: 0,
      totalCollaborations: 0,
      totalSupportTickets: 0,
      openSupportTickets: 0
    };
  }
};

export const loadShipments = async () => {
  try {
    console.log("Loading shipments from Supabase...");
    const { data, error } = await supabase
      .from('booking')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error loading shipments:", error);
      toast({
        title: "Error Loading Shipments",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
    
    console.log("Shipments loaded:", data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("Error in loadShipments:", error);
    return [];
  }
};

export const loadDemoRequests = async () => {
  try {
    console.log("Loading demo requests from Supabase...");
    const { data, error } = await supabase
      .from('demo_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error loading demo requests:", error);
      return [];
    }
    
    console.log("Demo requests loaded:", data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("Error in loadDemoRequests:", error);
    return [];
  }
};

export const loadCollaborations = async () => {
  try {
    console.log("Loading collaborations from Supabase...");
    const { data, error } = await supabase
      .from('collaborations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error loading collaborations:", error);
      return [];
    }
    
    console.log("Collaborations loaded:", data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("Error in loadCollaborations:", error);
    return [];
  }
};

export const loadSupportTickets = async () => {
  try {
    console.log("Loading support tickets from Supabase...");
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error loading support tickets:", error);
      toast({
        title: "Error Loading Support Tickets",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
    
    console.log("Support tickets loaded:", data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("Error in loadSupportTickets:", error);
    return [];
  }
};

export const loadTicketMessages = async (ticketId: string) => {
  try {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error loading ticket messages:", error);
    toast({
      title: "Error",
      description: "Failed to load message history",
      variant: "destructive",
    });
    return [];
  }
};

export const handleShipmentStatusChange = async (shipmentId: number, userId: string, newStatus: "pending" | "picked_up" | "in_transit" | "delivered" | "exception") => {
  try {
    const { error } = await supabase
      .from('booking')
      .update({ status: newStatus })
      .eq('id', shipmentId);
    
    if (error) {
      console.error("Supabase update error:", error);
      toast({
        title: "Status Update Failed",
        description: "Could not update the shipment status in the database.",
        variant: "destructive",
      });
      return false;
    }
    
    const event = {
      date: new Date().toISOString(),
      location: "Admin Dashboard",
      status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1).replace(/_/g, ' '),
      description: `Status updated by admin`
    };
    
    await updateShipmentStatus(shipmentId.toString(), userId, newStatus, event);
    
    toast({
      title: "Status Updated",
      description: `Shipment status changed to ${newStatus.replace(/_/g, ' ')}.`,
    });
    
    return true;
  } catch (error) {
    console.error("Error updating status:", error);
    toast({
      title: "Update Failed",
      description: "An unexpected error occurred while updating the status.",
      variant: "destructive",
    });
    return false;
  }
};

export const handleDemoStatusChange = async (demoId: string, newStatus: string) => {
  try {
    const { error } = await supabase
      .from('demo_requests')
      .update({ status: newStatus })
      .eq('id', demoId);
    
    if (error) {
      console.error("Supabase update error:", error);
      toast({
        title: "Status Update Failed",
        description: "Could not update the demo request status.",
        variant: "destructive",
      });
      return false;
    }
    
    toast({
      title: "Status Updated",
      description: `Demo request status changed to ${newStatus}.`,
    });
    
    return true;
  } catch (error) {
    console.error("Error updating demo status:", error);
    toast({
      title: "Update Failed",
      description: "An unexpected error occurred while updating the status.",
      variant: "destructive",
    });
    return false;
  }
};

export const handleSupportTicketStatusChange = async (ticketId: string, newStatus: string) => {
  try {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status: newStatus })
      .eq('id', ticketId);
    
    if (error) {
      console.error("Supabase update error:", error);
      toast({
        title: "Status Update Failed",
        description: "Could not update the support ticket status.",
        variant: "destructive",
      });
      return false;
    }
    
    toast({
      title: "Status Updated",
      description: `Support ticket status changed to ${newStatus}.`,
    });
    
    return true;
  } catch (error) {
    console.error("Error updating support ticket status:", error);
    toast({
      title: "Update Failed",
      description: "An unexpected error occurred while updating the status.",
      variant: "destructive",
    });
    return false;
  }
};

export const handleSendMessage = async (ticketId: string, userId: string, message: string, isAdmin: boolean = true) => {
  try {
    const messageData = {
      ticket_id: ticketId,
      user_id: userId,
      message: message.trim(),
      is_admin: isAdmin
    };

    const { error } = await supabase
      .from('support_messages')
      .insert(messageData);
    
    if (error) throw error;
    
    toast({
      title: "Message Sent",
      description: "Your response has been sent to the user.",
    });
    
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    toast({
      title: "Error",
      description: "Failed to send your response",
      variant: "destructive",
    });
    return false;
  }
};

export const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'delivered': return "bg-green-100 text-green-800";
    case 'in_transit': return "bg-blue-100 text-blue-800";
    case 'pending': return "bg-yellow-100 text-yellow-800";
    case 'picked_up': return "bg-purple-100 text-purple-800";
    case 'exception': return "bg-red-100 text-red-800";
    case 'scheduled': return "bg-blue-100 text-blue-800";
    case 'completed': return "bg-green-100 text-green-800";
    case 'cancelled': return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};
