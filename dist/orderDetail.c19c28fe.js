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
var _core = require("@xatom/core");
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
const renderLogoutBtn = ()=>{
    const btn = new (0, _core.WFComponent)(`[xa-type=cta-btn]`);
    btn.on("click", (e)=>{
        e.preventDefault();
        btn.setTextContent("Please wait...");
        (0, _auth.logout)();
    });
    btn.setTextContent("Logga ut");
};
const renderHistory = async ()=>{
    if (!checkSupabaseAccess()) return;
    const historyContainer = new (0, _core.WFDynamicList)("[xa-type='history-list']", {
        rowSelector: "[xa-type='history-item']",
        emptySelector: "[xa-type='no-previous-order']"
    });
    historyContainer.rowRenderer(({ rowData, rowElement })=>{
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
            const amountText = amount != null && !isNaN(amount) ? amount.toFixed(2) + " SEK" : "0.00 SEK";
            beloppComponent.setTextContent(amountText);
        } else console.error("One or more components not found in row element", vardNrComponent, beloppComponent);
        return rowElement;
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
const fetchLatestIncompleteOrder = async (userId)=>{
    if (!checkSupabaseAccess()) return null;
    try {
        const { data: order, error } = await (0, _supbaseDefault.default).from("Order").select("*").eq("user_id", userId).eq("is_complete", false).order("order_date", {
            ascending: false
        }).limit(1).single();
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
const fetchOrderStatus = async (orderId)=>{
    if (!checkSupabaseAccess()) return null;
    try {
        const { data: statusData, error: statusError } = await (0, _supbaseDefault.default).from("order_status").select("*").eq("order_id", orderId).eq("user_id", (0, _auth.userAuth).getUser().id).order("created_at", {
            ascending: false
        }).limit(1).single();
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
const orderDetails = async ()=>{
    if (!checkSupabaseAccess()) {
        const orderDetailsContainer = new (0, _core.WFComponent)(`[xa-type="order-details"]`);
        orderDetailsContainer.setHTML("<p>Access denied: Not on allowed domain.</p>");
        return;
    }
    renderLogoutBtn();
    renderHistory(); // Call to render history of completed orders
    const userId = (0, _auth.userAuth).getUser().id;
    const orderDetailsContainer = new (0, _core.WFComponent)(`[xa-type="order-details"]`);
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
        angeratt: "[xa-type=angerr\xe4tt]",
        totalgrampurchased: "[xa-type=totalgrampurchased]",
        utbetalningsdatum: "[xa-type=utbetalningsdatum]",
        utbetalningsdatum_last: "[xa-type=utbetalningsdatum-last]"
    });
    if (components.bestallning && components.datum && components.varderingsnummer && components.summa && components.angeratt && components.totalgrampurchased && components.kvittolink) {
        components.bestallning.setTextContent(order.barcodeid.toFixed(0));
        components.datum.setTextContent(order.order_date);
        components.varderingsnummer.setTextContent(order.valuation_number);
        components.summa.setTextContent(order.amount || "0.00");
        components.angeratt.setTextContent(order.cancellation_right_period);
        components.totalgrampurchased.setTextContent(order.total_gram_purchased || "0.00");
        components.kvittolink.setAttribute("href", order.recipe_download_link);
        if (components.utbetalningsdatum) components.utbetalningsdatum.setTextContent(order.utbetalningsdatum || "Inte tillg\xe4ngligt");
        if (components.utbetalningsdatum_last) components.utbetalningsdatum_last.setTextContent(order.utbetalningsdatum_last || "Inte tillg\xe4ngligt");
    } else {
        console.error("One or more components not found in order details container", components);
        return;
    }
    const statusData = await fetchOrderStatus(order.id);
    if (!statusData) return;
    const formatDateTime = (isoString)=>{
        const date = new Date(isoString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    };
    const step = statusData.step || 1;
    const substep = statusData.substep || 1;
    const kuvertMottagen = statusData.kuvert_mottagen ? formatDateTime(statusData.kuvert_mottagen) : "Not available";
    const stepElement = new (0, _core.WFComponent)(`[xa-type="step"]`);
    const substepElement = new (0, _core.WFComponent)(`[xa-type="substep"]`);
    const kuvertMottagenElement = new (0, _core.WFComponent)(`[xa-type="kuvertmottagen"]`);
    if (stepElement && substepElement && kuvertMottagenElement) {
        stepElement.setTextContent(`${step}`);
        substepElement.setTextContent(`${substep}`);
        kuvertMottagenElement.setTextContent(kuvertMottagen);
    } else console.error("One or more step-related components not found", {
        stepElement,
        substepElement,
        kuvertMottagenElement
    });
};
orderDetails();

},{"@xatom/core":"8w4K8","../auth":"du3Bh","../supbase":"anyOU","@parcel/transformer-js/src/esmodule-helpers.js":"5oERU"}]},[], null, "parcelRequire89a0")

//# sourceMappingURL=orderDetail.c19c28fe.js.map
