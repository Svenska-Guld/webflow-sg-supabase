// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"hNkb0":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "orderDetails", ()=>orderDetails);
var _core = require("@xatom/core"); // Added navigate
var _auth = require("../auth");
var _supbase = require("../supbase");
var _supbaseDefault = parcelHelpers.interopDefault(_supbase);
// Check if Supabase client is available
const checkSupabaseAccess = ()=>{
    if (!(0, _supbaseDefault.default)) {
        console.error("Access denied: Not on allowed domain");
        return false;
    }
    return true;
};
// --- The renderHistory Function ---
/**
 * Fetches completed orders for the current user from Supabase
 * and renders them into the designated history list element on the page.
 */ const renderHistory = async ()=>{
    if (!checkSupabaseAccess()) return;
    const historyContainer = new (0, _core.WFDynamicList)("[xa-type='history-list']", {
        rowSelector: "[xa-type='history-item']",
        emptySelector: "[xa-type='no-previous-order']"
    });
    // Replace the existing rowRenderer block with this one:
    historyContainer.rowRenderer(({ rowData, rowElement })=>{
        // Basic validation
        if (!rowData) {
            console.warn("History rowRenderer: Received null rowData.");
            return rowElement;
        }
        if (!rowElement) {
            console.warn("History rowRenderer: Received null rowElement for data:", rowData);
            return rowElement;
        }
        console.log(`History: Rendering item for Order ID ${rowData.id ?? "N/A"}`);
        // Helper to safely get child components
        const getChildSafely = (selector)=>{
            try {
                const comp = rowElement.getChildAsComponent(selector);
                // Add an extra check here - sometimes getChildAsComponent might not throw but return null
                if (!comp) {
                    console.warn(`History Row ${rowData.id}: Child '${selector}' not found (returned null).`);
                    return null;
                }
                return comp;
            } catch (e) {
                console.warn(`History Row ${rowData.id}: Child '${selector}' error:`, e.message);
                return null;
            }
        };
        // Get all required components
        const vardNrComponent = getChildSafely("[xa-type='history-vard-nr']");
        const beloppComponent = getChildSafely("[xa-type='history-belopp']");
        // *** ADDED: Get the PDF link component ***
        const pdfLinkComponent = getChildSafely("[xa-type='pdf-link-history']");
        // Populate found components
        if (vardNrComponent) vardNrComponent.setTextContent(rowData.valuation_number || "N/A");
        if (beloppComponent) {
            // Using the simple formatting from your base code
            const amount = typeof rowData.amount === "string" ? parseFloat(rowData.amount) : rowData.amount;
            const amountText = amount != null && !isNaN(amount) ? amount.toFixed(2) + " kr" : "0.00 kr"; // Added kr suffix
            beloppComponent.setTextContent(amountText);
        }
        // *** ADDED: Populate the PDF link href ***
        if (pdfLinkComponent) {
            const link = rowData.recipe_download_link; // Get link from data
            console.log(`  -> Setting PDF link for ${rowData.id}: ${link || "#"}`);
            pdfLinkComponent.setAttribute("href", link || "#"); // Set href, fallback to '#'
            // Make valid links open in a new tab for better UX
            if (link && link !== "#") {
                pdfLinkComponent.setAttribute("target", "_blank");
                pdfLinkComponent.setAttribute("rel", "noopener noreferrer"); // Security best practice
            } else {
                // Remove target if link is invalid/missing
                pdfLinkComponent.removeAttribute("target");
                pdfLinkComponent.removeAttribute("rel");
            }
        } else // Add warning if PDF link specifically wasn't found
        console.warn(`History Row ${rowData.id}: Component '[xa-type="pdf-link-history"]' not found in HTML template.`);
        return rowElement; // Return the modified element
    });
    try {
        const { data: historyData, error } = await (0, _supbaseDefault.default).from("Order").select("*").eq("user_id", (0, _auth.userAuth).getUser().id).eq("is_complete", true).order("order_date", {
            ascending: false
        });
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
// --- Helper Function (Date/Time Formatting - Still Needed) ---
const formatDate = (dateValue)=>{
    if (!dateValue) return "Inte tillg\xe4ngligt";
    try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return "Ogiltigt datum";
        return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getFullYear()}`;
    } catch (e) {
        console.error("Error formatting date:", dateValue, e);
        return "Datumfel";
    }
};
const formatDateTime = (isoString)=>{
    if (!isoString) return "N/A";
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return "Ogiltigt datum";
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    } catch (e) {
        console.error("Error formatting date/time:", isoString, e);
        return "Datum/tid-fel";
    }
};
// --- Reworked Data Fetching Functions ---
const fetchLatestIncompleteOrder = async (userId)=>{
    // Using maybeSingle from previous good version
    if (!checkSupabaseAccess()) return null;
    console.log("Fetching latest incomplete order for user:", userId);
    try {
        const { data: order, error } = await (0, _supbaseDefault.default).from("Order").select("*") // Fetches all columns, including new ones
        .eq("user_id", userId).eq("is_complete", false).order("order_date", {
            ascending: false
        }).limit(1).maybeSingle();
        if (error) console.error("Error fetching latest incomplete order:", error);
        if (!order) console.log("No active incomplete order found.");
        else console.log("Fetched latest incomplete order:", order);
        return order ? order : null;
    } catch (error) {
        console.error("Exception fetching latest incomplete order:", error);
        return null;
    }
};
const fetchOrderStatus = async (orderId)=>{
    // Using maybeSingle from previous good version
    if (!checkSupabaseAccess() || !orderId) return null;
    console.log("Fetching status for order ID:", orderId);
    try {
        const { data: statusData, error: statusError } = await (0, _supbaseDefault.default).from("order_status").select("*").eq("order_id", orderId)// Remove user_id check unless order_id is not unique across users in status table
        // .eq("user_id", userAuth.getUser().id)
        .order("created_at", {
            ascending: false
        }).limit(1).maybeSingle();
        if (statusError) console.error("Error fetching order status:", statusError);
        if (!statusData) console.log("No status found for order ID:", orderId);
        else console.log("Fetched latest order status:", statusData);
        return statusData ? statusData : null;
    } catch (error) {
        console.error("Exception fetching order status:", error);
        return null;
    }
};
const orderDetails = async ()=>{
    // Initial checks
    if (!checkSupabaseAccess()) return;
    let orderDetailsContainerComp = null;
    try {
        orderDetailsContainerComp = new (0, _core.WFComponent)(`[xa-type="order-details"]`);
        if (!orderDetailsContainerComp) throw new Error("Container component is null.");
    } catch (error) {
        console.error("CRITICAL: Could not find container '[xa-type=\"order-details\"]'.", error.message);
        return; // Stop
    }
    console.log("Main container found.");
    // Assume renderLogoutBtn() and renderHistory() are called elsewhere or before this
    const userId = (0, _auth.userAuth).getUser()?.id;
    if (!userId) {
        orderDetailsContainerComp.setHTML("<p>V\xe4nligen <a href='/auth/sign-in'>logga in</a>.</p>");
        orderDetailsContainerComp.getChildAsComponent(".current-order-wrapper")?.setStyle({
            display: "none"
        });
        // Optionally hide history too if it wasn't handled in renderHistory
        // orderDetailsContainerComp.getChildAsComponent("[xa-type='history-list']")?.setStyle({ display: 'none' });
        // orderDetailsContainerComp.getChildAsComponent(".history-heading")?.setStyle({ display: 'none' });
        return;
    }
    // Fetch active order
    const order = await fetchLatestIncompleteOrder(userId);
    // Get display elements (using component methods is safer)
    const noOrderElement = orderDetailsContainerComp.getChildAsComponent(`[xa-type="no-active-order"]`);
    const currentOrderWrapper = orderDetailsContainerComp.getChildAsComponent(".current-order-wrapper");
    // --- Handle No Active Order ---
    if (!order) {
        console.log("Displaying 'No active order' state.");
        if (currentOrderWrapper) currentOrderWrapper.setStyle({
            display: "none"
        });
        else console.warn("'.current-order-wrapper' element not found to hide.");
        if (noOrderElement) noOrderElement.setStyle({
            display: "block"
        });
        else {
            console.warn("Element '[xa-type=\"no-active-order\"]' not found. Adding fallback message.");
            // Use standard DOM API if component method isn't suitable
            const containerElem = document.querySelector('[xa-type="order-details"]');
            if (containerElem && !containerElem.querySelector(".fallback-no-order")) containerElem.insertAdjacentHTML("afterbegin", '<p class="fallback-no-order">Du har ingen aktiv f\xf6rs\xe4ljning just nu.</p>');
        }
        return; // Stop execution
    }
    // --- Handle Active Order Found ---
    console.log(`Active order found: ID=${order.id}. Displaying details...`);
    if (noOrderElement) noOrderElement.setStyle({
        display: "none"
    });
    if (currentOrderWrapper) currentOrderWrapper.setStyle({
        display: "block"
    }); // Or 'flex', 'grid' etc.
    else console.warn("'.current-order-wrapper' element not found to show.");
    // Remove any fallback message
    document.querySelector('[xa-type="order-details"] .fallback-no-order')?.remove();
    // --- Populate Order Details ---
    console.log("Populating active order details fields...");
    // Helper to safely get and populate (No formatCurrency/formatGrams)
    const getAndPopulate = (selector, value, formatter, attribute)=>{
        console.log(`  -> Populating ${selector}...`);
        let component = null;
        try {
            // Try getting the component instance
            component = orderDetailsContainerComp.getChildAsComponent(selector);
            if (!component) {
                console.warn(`    Component '${selector}' not found in HTML.`);
                return; // Skip if component not found
            }
            // Format value if formatter provided, otherwise use toString or default
            const formattedValue = formatter ? formatter(value) : value?.toString() ?? ""; // Basic formatting
            console.log(`    Setting value for ${selector}: ${formattedValue}`);
            // Set attribute or text content
            if (attribute === "href") {
                component.setAttribute(attribute, formattedValue || "#");
                if (value && value !== "#") component.setAttribute("target", "_blank");
                else component.removeAttribute("target");
            } else component.setTextContent(formattedValue);
        } catch (e) {
            // Catch errors during getChild or population
            console.warn(`    Error processing component '${selector}':`, e.message);
            if (e.message?.includes("Could not find")) console.warn(`    ^^^ Element for selector '${selector}' likely MISSING in HTML.`);
        }
    };
    // Populate fields based on your list and interface
    // Using basic .toString() or specific formatters where needed (like dates)
    getAndPopulate("[xa-type=datum]", order.order_date, formatDate);
    getAndPopulate("[xa-type=varderingsnummer]", order.valuation_number || "P\xe5g\xe5ende");
    // Map specific gold grams field to the 'totalgrampurchased' element
    getAndPopulate("[xa-type=totalgrampurchased]", order.total_guldgram_kopt?.toString() ?? "0.00");
    getAndPopulate("[xa-type=totolsilverkopt]", order.total_silver_kopt?.toString() ?? "0.00");
    // Ensure correct column name casing from DB ("Total_ej_adelmetall" or "total_ej_adelmetall")
    getAndPopulate("[xa-type=totalejadelmetall]", order.total_ej_adelmetall?.toString() ?? "0.00");
    getAndPopulate("[xa-type=totalsilverpris]", order.total_silver_pris?.toString() ?? "0.00 kr"); // Add suffix manually if needed
    getAndPopulate("[xa-type=summa]", order.amount?.toString() ?? "0.00 kr"); // Total amount, add suffix manually
    getAndPopulate("[xa-type=utbetalningsdatum]", order.utbetalningsdatum, formatDate);
    getAndPopulate("[xa-type=utbetalningsdatum-last]", order.utbetalningsdatum_last, formatDate);
    getAndPopulate("[xa-type=pdf-link]", order.recipe_download_link, (v)=>v, "href");
    // Note: xa-type="totalgoldvalue" is NOT populated as the field wasn't in the interface/schema.
    // Other fields like barcodeid, order_id, cancellation_right_period are also not populated.
    // --- Fetch and Populate Status ---
    console.log("Fetching order status...");
    const statusData = await fetchOrderStatus(order.id.toString()); // Use active order ID
    const step = statusData?.step ?? 1;
    const substep = statusData?.substep ?? 1;
    const kuvertMottagen = formatDateTime(statusData?.kuvert_mottagen ?? null); // Keep date formatting
    console.log(`Status values: Step=${step}, Substep=${substep}`);
    // Helper for safe status component fetching
    // Helper for safe status component fetching
    const getStatusComponent = (selector)=>{
        let component = null; // Initialize as null
        try {
            // Attempt to get the component
            component = orderDetailsContainerComp.getChildAsComponent(selector); // Use ! assertion as container component should exist here
            // Check if the component was successfully found (WFComponent might return null/undefined if selector doesn't match, though often it throws)
            if (!component) {
                console.warn(`Status component '${selector}' not found (returned null/undefined).`);
                return null; // Explicitly return null if not found
            }
            // If we got here and didn't throw, component should be valid
            return component;
        } catch (e) {
            // Catch errors if getChildAsComponent throws (e.g., selector invalid, "Could not find null")
            console.warn(`Status component '${selector}' could not be retrieved:`, e.message);
            return null; // Explicitly return null on error
        }
    // Note: This line should now be unreachable, but ensures TS is happy if needed.
    // return null;
    };
    // REQUIRED HTML: Hidden elements xa-type="step", xa-type="substep" id="substepping"
    const stepElement = getStatusComponent(`[xa-type="step"]`);
    const substepElement = getStatusComponent(`[xa-type="substep"]`);
    // REQUIRED HTML: Visible element xa-type="kuvertmottagen"
    const kuvertMottagenElement = getStatusComponent(`[xa-type="kuvertmottagen"]`);
    // Populate status elements
    if (stepElement) stepElement.setTextContent(`${step}`);
    else console.warn("REQUIRED HTML MISSING: '[xa-type=\"step\"]'.");
    if (substepElement) {
        substepElement.setTextContent(`${substep}`);
        // Update element for embedded script
        const substeppingFieldForScript = document.getElementById("substepping");
        if (substeppingFieldForScript) {
            if (substeppingFieldForScript.textContent !== `${substep}`) {
                substeppingFieldForScript.textContent = `${substep}`;
                // Trigger embedded script update
                if (typeof window.updateSubstepAndProgress === "function") {
                    console.log("Triggering embedded updateSubstepAndProgress()...");
                    try {
                        window.updateSubstepAndProgress();
                    } catch (embedError) {
                        console.error("Error calling embedded script:", embedError);
                    }
                } else console.warn("window.updateSubstepAndProgress not found.");
            }
        } else console.warn("REQUIRED HTML MISSING: Element with id='substepping'.");
    } else console.warn("REQUIRED HTML MISSING: '[xa-type=\"substep\"]'.");
    if (kuvertMottagenElement) kuvertMottagenElement.setTextContent(kuvertMottagen);
    else console.warn("Component '[xa-type=kuvertmottagen]' not found.");
    console.log("Order details processing complete.");
};
// Initialization logic remains the same
const initOrderDetails = ()=>{
    const container = document.querySelector('[xa-type="order-details"]');
    if (container) {
        console.log("Initializing order details...");
        orderDetails();
    }
};
renderHistory();
initOrderDetails();

},{"@xatom/core":"8w4K8","../auth":"du3Bh","../supbase":"anyOU","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}]},[], null, "parcelRequire89a0")

//# sourceMappingURL=orderDetail.c19c28fe.js.map
