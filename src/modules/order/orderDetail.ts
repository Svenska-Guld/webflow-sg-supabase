import { WFComponent, WFDynamicList } from "@xatom/core";
import { logout, userAuth } from "../auth";
import supabase from "../supbase";

// Check if Supabase client is available
const checkSupabaseAccess = () => {
  if (!supabase) {
    console.error('Access denied: Not on allowed domain');
    return false;
  }
  return true;
};

interface Order {
    id: string;
    user_id: string;
    order_id: string;
    is_complete: boolean;
    order_date: string;
    valuation_number: string;
    amount: string | number | null;
    cancellation_right_period: string;
    total_gram_purchased: string | number | null;
    recipe_download_link: string;
    barcodeid: number;
    utbetalningsdatum: string | null;
    utbetalningsdatum_last: string | null;
}

const renderLogoutBtn = () => {
    const btn = new WFComponent(`[xa-type=cta-btn]`);
    btn.on("click", (e) => {
        e.preventDefault();
        btn.setTextContent("Please wait...");
        logout();
    });
    btn.setTextContent("Logga ut");
};

const renderHistory = async () => {
    if (!checkSupabaseAccess()) return;

    const historyContainer = new WFDynamicList<Order>("[xa-type='history-list']", {
        rowSelector: "[xa-type='history-item']",
        emptySelector: "[xa-type='no-previous-order']"
    });

    historyContainer.rowRenderer(({ rowData, rowElement }) => {
        if (!rowData || !rowElement) {
            console.error("Row data or element is missing", rowData, rowElement);
            return rowElement; // Return the row element to maintain the structure
        }

        console.log("Rendering row with data", rowData);

        const vardNrComponent = rowElement.getChildAsComponent("[xa-type='history-vard-nr']");
        const beloppComponent = rowElement.getChildAsComponent("[xa-type='history-belopp']");

        if (vardNrComponent && beloppComponent) {
            vardNrComponent.setTextContent(rowData.valuation_number || "N/A");
    
            // Convert amount to number if it's a string, and then apply toFixed
            const amount = typeof rowData.amount === "string" ? parseFloat(rowData.amount) : rowData.amount;
            const amountText = amount != null && !isNaN(amount) ? amount.toFixed(2) + ' SEK' : "0.00 SEK";
            beloppComponent.setTextContent(amountText);
        } else {
            console.error("One or more components not found in row element", vardNrComponent, beloppComponent);
        }

        return rowElement;
    });

    try {
        const { data: historyData, error } = await supabase
            .from("Order")
            .select("*")
            .eq("user_id", userAuth.getUser().id)
            .eq("is_complete", true)
            .order("order_date", { ascending: false });

        if (error) {
            console.error("Error fetching order history:", error);
            return;
        }

        console.log("Setting data for history", historyData);
        historyContainer.setData(historyData || []);
    } catch (error) {
        console.error("Failed to fetch or render order history:", error);
    }
};

const fetchLatestIncompleteOrder = async (userId: string) => {
    if (!checkSupabaseAccess()) return null;

    try {
        const { data: order, error } = await supabase
            .from("Order")
            .select("*")
            .eq("user_id", userId)
            .eq("is_complete", false)
            .order("order_date", { ascending: false })
            .limit(1)
            .single();

        if (error || !order) {
            console.error("Error fetching latest incomplete order or no such order exists", error);
            return null;
        }

        console.log("Fetched latest incomplete order", order);
        return order;
    } catch (error) {
        console.error("Error fetching latest incomplete order:", error);
        return null;
    }
};

const fetchOrderStatus = async (orderId: string) => {
    if (!checkSupabaseAccess()) return null;

    try {
        const { data: statusData, error: statusError } = await supabase
            .from("order_status")
            .select("*")
            .eq("order_id", orderId)
            .eq("user_id", userAuth.getUser().id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (statusError) {
            console.error("Error fetching order status:", statusError);
            return null;
        }

        console.log("Fetched latest order status", statusData);
        return statusData;
    } catch (error) {
        console.error("Error fetching order status:", error);
        return null;
    }
};

export const orderDetails = async () => {
    if (!checkSupabaseAccess()) {
        const orderDetailsContainer = new WFComponent(`[xa-type="order-details"]`);
        orderDetailsContainer.setHTML("<p>Access denied: Not on allowed domain.</p>");
        return;
    }

    renderLogoutBtn();
    renderHistory();  // Call to render history of completed orders

    const userId = userAuth.getUser().id;
    const orderDetailsContainer = new WFComponent(`[xa-type="order-details"]`);

    const order = await fetchLatestIncompleteOrder(userId);
    if (!order) {
        orderDetailsContainer.setHTML("<p>No active order found.</p>");
        return;
    }

    const components = orderDetailsContainer.getManyChildAsComponents({
        kvittolink: "[xa-type=pdf-link]",
        bestallning: "[xa-type=bestallning]",
        datum: "[xa-type=datum]",
        varderingsnummer: "[xa-type=varderingsnummer]",
        summa: "[xa-type=summa]",
        angeratt: "[xa-type=angerrätt]",
        totalgrampurchased: "[xa-type=totalgrampurchased]",
        utbetalningsdatum: "[xa-type=utbetalningsdatum]",
        utbetalningsdatum_last: "[xa-type=utbetalningsdatum-last]",
    });

    if (components.bestallning && components.datum && components.varderingsnummer && components.summa && components.angeratt && components.totalgrampurchased && components.kvittolink) {
        components.bestallning.setTextContent(order.barcodeid.toFixed(0));
        components.datum.setTextContent(order.order_date);
        components.varderingsnummer.setTextContent(order.valuation_number);
        components.summa.setTextContent(order.amount || "0.00");
        components.angeratt.setTextContent(order.cancellation_right_period);
        components.totalgrampurchased.setTextContent(order.total_gram_purchased || "0.00");
        components.kvittolink.setAttribute("href", order.recipe_download_link);
        
        if (components.utbetalningsdatum) {
            components.utbetalningsdatum.setTextContent(order.utbetalningsdatum || "Inte tillgängligt");
        }
        if (components.utbetalningsdatum_last) {
            components.utbetalningsdatum_last.setTextContent(order.utbetalningsdatum_last || "Inte tillgängligt");
        }
    } else {
        console.error("One or more components not found in order details container", components);
        return;
    }

    const statusData = await fetchOrderStatus(order.id);
    if (!statusData) return;

    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day}.${month}.${year} ${hours}:${minutes}`;
    };

    const step = statusData.step || 1;
    const substep = statusData.substep || 1;
    const kuvertMottagen = statusData.kuvert_mottagen ? formatDateTime(statusData.kuvert_mottagen) : "Not available";

    const stepElement = new WFComponent(`[xa-type="step"]`);
    const substepElement = new WFComponent(`[xa-type="substep"]`);
    const kuvertMottagenElement = new WFComponent(`[xa-type="kuvertmottagen"]`);

    if (stepElement && substepElement && kuvertMottagenElement) {
        stepElement.setTextContent(`${step}`);
        substepElement.setTextContent(`${substep}`);
        kuvertMottagenElement.setTextContent(kuvertMottagen);
    } else {
        console.error("One or more step-related components not found", { stepElement, substepElement, kuvertMottagenElement });
    }
};

orderDetails();
