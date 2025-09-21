import { r as reactExports, j as jsxRuntimeExports, c as createRoot } from "./client.js";
const OverlayApp = () => {
  const [isVisible, setIsVisible] = reactExports.useState(false);
  const [suggestions, setSuggestions] = reactExports.useState([]);
  const [activeField, setActiveField] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const handleFieldFocus = (event) => {
      const target = event.target;
      if (isFormField(target)) {
        setActiveField(target);
        setIsVisible(true);
      }
    };
    const handleFieldBlur = () => {
      setTimeout(() => {
        setIsVisible(false);
        setActiveField(null);
      }, 200);
    };
    document.addEventListener("focusin", handleFieldFocus);
    document.addEventListener("focusout", handleFieldBlur);
    return () => {
      document.removeEventListener("focusin", handleFieldFocus);
      document.removeEventListener("focusout", handleFieldBlur);
    };
  }, []);
  const isFormField = (element) => {
    const formFieldSelectors = [
      'input[type="text"]',
      'input[type="email"]',
      'input[type="tel"]',
      'input[type="url"]',
      "textarea",
      "select"
    ];
    return formFieldSelectors.some((selector) => element.matches(selector));
  };
  const getFieldPosition = (field) => {
    const rect = field.getBoundingClientRect();
    return {
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      width: rect.width
    };
  };
  if (!isVisible || !activeField) {
    return null;
  }
  const position = getFieldPosition(activeField);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-48",
      style: {
        top: position.top,
        left: position.left,
        width: Math.max(position.width, 192)
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500 mb-2", children: "Suggestions" }),
        suggestions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-500 py-2", children: "No suggestions available" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: suggestions.map((suggestion, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded",
            onClick: () => {
              console.log("Apply suggestion:", suggestion);
              setIsVisible(false);
            },
            children: suggestion.value
          },
          index
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 pt-2 border-t border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded",
            onClick: () => {
              console.log("Open snippet library");
            },
            children: "More snippets..."
          }
        ) })
      ]
    }
  );
};
const container = document.getElementById("local-fill-overlay");
if (!container) {
  throw new Error("Overlay container not found");
}
const root = createRoot(container);
root.render(/* @__PURE__ */ jsxRuntimeExports.jsx(OverlayApp, {}));
//# sourceMappingURL=overlay.js.map
