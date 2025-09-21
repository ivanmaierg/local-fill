// src/components/Button.tsx
import { jsx } from "react/jsx-runtime";
var Button = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500"
  };
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  return /* @__PURE__ */ jsx("button", { className: classes, ...props, children });
};

// src/components/Input.tsx
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
var Input = ({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const inputClasses = `
    block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500
    ${error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}
    ${className}
  `.trim();
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
    label && /* @__PURE__ */ jsx2("label", { htmlFor: inputId, className: "block text-sm font-medium text-gray-700", children: label }),
    /* @__PURE__ */ jsx2(
      "input",
      {
        id: inputId,
        className: inputClasses,
        ...props
      }
    ),
    error && /* @__PURE__ */ jsx2("p", { className: "text-sm text-red-600", children: error }),
    helperText && !error && /* @__PURE__ */ jsx2("p", { className: "text-sm text-gray-500", children: helperText })
  ] });
};

// src/components/Modal.tsx
import { useEffect } from "react";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md"
}) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };
  return /* @__PURE__ */ jsx3("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: /* @__PURE__ */ jsxs2("div", { className: "flex min-h-screen items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx3(
      "div",
      {
        className: "fixed inset-0 bg-black bg-opacity-50 transition-opacity",
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsxs2("div", { className: `relative w-full ${sizeClasses[size]} bg-white rounded-lg shadow-xl`, children: [
      title && /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-between p-6 border-b border-gray-200", children: [
        /* @__PURE__ */ jsx3("h3", { className: "text-lg font-semibold text-gray-900", children: title }),
        /* @__PURE__ */ jsxs2(
          "button",
          {
            onClick: onClose,
            className: "text-gray-400 hover:text-gray-600 transition-colors",
            children: [
              /* @__PURE__ */ jsx3("span", { className: "sr-only", children: "Close" }),
              /* @__PURE__ */ jsx3("svg", { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx3("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx3("div", { className: "p-6", children })
    ] })
  ] }) });
};

// src/components/Toast.tsx
import { createContext, useContext, useState, useCallback } from "react";
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
var ToastContext = createContext(void 0);
var useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
var ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    const duration = toast.duration || 5e3;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);
  return /* @__PURE__ */ jsxs3(ToastContext.Provider, { value: { toasts, addToast, removeToast }, children: [
    children,
    /* @__PURE__ */ jsx4(ToastContainer, { toasts, onRemove: removeToast })
  ] });
};
var ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;
  return /* @__PURE__ */ jsx4("div", { className: "fixed top-4 right-4 z-50 space-y-2", children: toasts.map((toast) => /* @__PURE__ */ jsx4(ToastItem, { toast, onRemove }, toast.id)) });
};
var ToastItem = ({ toast, onRemove }) => {
  const typeClasses = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  };
  const iconClasses = {
    success: "text-green-400",
    error: "text-red-400",
    warning: "text-yellow-400",
    info: "text-blue-400"
  };
  const type = toast.type || "info";
  return /* @__PURE__ */ jsx4("div", { className: `max-w-sm w-full border rounded-lg shadow-lg p-4 ${typeClasses[type]}`, children: /* @__PURE__ */ jsxs3("div", { className: "flex items-start", children: [
    /* @__PURE__ */ jsx4("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsxs3("div", { className: `h-5 w-5 ${iconClasses[type]}`, children: [
      type === "success" && /* @__PURE__ */ jsx4("svg", { fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx4("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }),
      type === "error" && /* @__PURE__ */ jsx4("svg", { fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx4("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }),
      type === "warning" && /* @__PURE__ */ jsx4("svg", { fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx4("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }),
      type === "info" && /* @__PURE__ */ jsx4("svg", { fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx4("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) })
    ] }) }),
    /* @__PURE__ */ jsxs3("div", { className: "ml-3 w-0 flex-1", children: [
      toast.title && /* @__PURE__ */ jsx4("p", { className: "text-sm font-medium", children: toast.title }),
      toast.description && /* @__PURE__ */ jsx4("p", { className: "mt-1 text-sm", children: toast.description })
    ] }),
    /* @__PURE__ */ jsx4("div", { className: "ml-4 flex-shrink-0 flex", children: /* @__PURE__ */ jsxs3(
      "button",
      {
        onClick: () => onRemove(toast.id),
        className: "inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600",
        children: [
          /* @__PURE__ */ jsx4("span", { className: "sr-only", children: "Close" }),
          /* @__PURE__ */ jsx4("svg", { className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx4("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) })
        ]
      }
    ) })
  ] }) });
};

// src/components/Select.tsx
import { useState as useState2, useRef, useEffect as useEffect2 } from "react";
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
var Select = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  label,
  error,
  helperText,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState2(false);
  const [selectedOption, setSelectedOption] = useState2(null);
  const selectRef = useRef(null);
  useEffect2(() => {
    const option = options.find((opt) => opt.value === value);
    setSelectedOption(option || null);
  }, [value, options]);
  useEffect2(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleSelect = (option) => {
    if (option.disabled) return;
    setSelectedOption(option);
    setIsOpen(false);
    onChange?.(option.value);
  };
  const handleKeyDown = (event) => {
    if (disabled) return;
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const currentIndex = options.findIndex((opt) => opt.value === value);
          const nextIndex = Math.min(currentIndex + 1, options.length - 1);
          const nextOption = options[nextIndex];
          if (nextOption && !nextOption.disabled) {
            handleSelect(nextOption);
          }
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const currentIndex = options.findIndex((opt) => opt.value === value);
          const prevIndex = Math.max(currentIndex - 1, 0);
          const prevOption = options[prevIndex];
          if (prevOption && !prevOption.disabled) {
            handleSelect(prevOption);
          }
        }
        break;
    }
  };
  const selectClasses = `
    relative w-full
    ${className}
  `.trim();
  const triggerClasses = `
    flex items-center justify-between w-full px-3 py-2 text-left
    border rounded-md shadow-sm placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}
    ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}
  `.trim();
  return /* @__PURE__ */ jsxs4("div", { className: "space-y-1", children: [
    label && /* @__PURE__ */ jsx5("label", { className: "block text-sm font-medium text-gray-700", children: label }),
    /* @__PURE__ */ jsxs4("div", { className: selectClasses, ref: selectRef, children: [
      /* @__PURE__ */ jsxs4(
        "button",
        {
          type: "button",
          className: triggerClasses,
          onClick: () => !disabled && setIsOpen(!isOpen),
          onKeyDown: handleKeyDown,
          disabled,
          "aria-haspopup": "listbox",
          "aria-expanded": isOpen,
          children: [
            /* @__PURE__ */ jsx5("span", { className: selectedOption ? "text-gray-900" : "text-gray-500", children: selectedOption ? selectedOption.label : placeholder }),
            /* @__PURE__ */ jsx5(
              "svg",
              {
                className: `h-5 w-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`,
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                children: /* @__PURE__ */ jsx5("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
              }
            )
          ]
        }
      ),
      isOpen && /* @__PURE__ */ jsx5("div", { className: "absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto", children: options.map((option) => /* @__PURE__ */ jsx5(
        "button",
        {
          type: "button",
          className: `
                  w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                  ${option.disabled ? "text-gray-400 cursor-not-allowed" : "text-gray-900"}
                  ${option.value === value ? "bg-blue-50 text-blue-900" : ""}
                `,
          onClick: () => handleSelect(option),
          disabled: option.disabled,
          children: option.label
        },
        option.value
      )) })
    ] }),
    error && /* @__PURE__ */ jsx5("p", { className: "text-sm text-red-600", children: error }),
    helperText && !error && /* @__PURE__ */ jsx5("p", { className: "text-sm text-gray-500", children: helperText })
  ] });
};

// src/components/Card.tsx
import { jsx as jsx6 } from "react/jsx-runtime";
var Card = ({ children, className = "" }) => {
  return /* @__PURE__ */ jsx6("div", { className: `bg-white rounded-lg border border-gray-200 shadow-sm ${className}`, children });
};
var CardHeader = ({ children, className = "" }) => {
  return /* @__PURE__ */ jsx6("div", { className: `px-6 py-4 border-b border-gray-200 ${className}`, children });
};
var CardContent = ({ children, className = "" }) => {
  return /* @__PURE__ */ jsx6("div", { className: `px-6 py-4 ${className}`, children });
};
var CardFooter = ({ children, className = "" }) => {
  return /* @__PURE__ */ jsx6("div", { className: `px-6 py-4 border-t border-gray-200 ${className}`, children });
};

// src/components/Label.tsx
import { jsx as jsx7, jsxs as jsxs5 } from "react/jsx-runtime";
var Label = ({
  children,
  required = false,
  className = "",
  ...props
}) => {
  return /* @__PURE__ */ jsxs5(
    "label",
    {
      className: `block text-sm font-medium text-gray-700 ${className}`,
      ...props,
      children: [
        children,
        required && /* @__PURE__ */ jsx7("span", { className: "text-red-500 ml-1", children: "*" })
      ]
    }
  );
};

// src/components/ProfileValidation.tsx
import { jsx as jsx8, jsxs as jsxs6 } from "react/jsx-runtime";
var ProfileValidation = ({
  errors,
  warnings,
  completeness
}) => {
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;
  const hasIssues = hasErrors || hasWarnings || completeness.missing.length > 0;
  if (!hasIssues) {
    return /* @__PURE__ */ jsx8("div", { className: "bg-green-50 border border-green-200 rounded-md p-4", children: /* @__PURE__ */ jsxs6("div", { className: "flex", children: [
      /* @__PURE__ */ jsx8("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx8("svg", { className: "h-5 w-5 text-green-400", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx8("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }) }),
      /* @__PURE__ */ jsxs6("div", { className: "ml-3", children: [
        /* @__PURE__ */ jsx8("h3", { className: "text-sm font-medium text-green-800", children: "Profile is valid and complete!" }),
        /* @__PURE__ */ jsx8("div", { className: "mt-2 text-sm text-green-700", children: /* @__PURE__ */ jsxs6("p", { children: [
          "Completeness: ",
          completeness.score,
          "%"
        ] }) })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxs6("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs6("div", { className: "bg-blue-50 border border-blue-200 rounded-md p-4", children: [
      /* @__PURE__ */ jsxs6("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx8("h3", { className: "text-sm font-medium text-blue-800", children: "Profile Completeness" }),
        /* @__PURE__ */ jsxs6("span", { className: "text-sm font-bold text-blue-900", children: [
          completeness.score,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsx8("div", { className: "mt-2", children: /* @__PURE__ */ jsx8("div", { className: "w-full bg-blue-200 rounded-full h-2", children: /* @__PURE__ */ jsx8(
        "div",
        {
          className: "bg-blue-600 h-2 rounded-full transition-all duration-300",
          style: { width: `${completeness.score}%` }
        }
      ) }) })
    ] }),
    hasErrors && /* @__PURE__ */ jsx8("div", { className: "bg-red-50 border border-red-200 rounded-md p-4", children: /* @__PURE__ */ jsxs6("div", { className: "flex", children: [
      /* @__PURE__ */ jsx8("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx8("svg", { className: "h-5 w-5 text-red-400", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx8("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }),
      /* @__PURE__ */ jsxs6("div", { className: "ml-3", children: [
        /* @__PURE__ */ jsx8("h3", { className: "text-sm font-medium text-red-800", children: "Validation Errors" }),
        /* @__PURE__ */ jsx8("div", { className: "mt-2 text-sm text-red-700", children: /* @__PURE__ */ jsx8("ul", { className: "list-disc list-inside space-y-1", children: errors.map((error, index) => /* @__PURE__ */ jsxs6("li", { children: [
          /* @__PURE__ */ jsxs6("strong", { children: [
            error.field,
            ":"
          ] }),
          " ",
          error.message
        ] }, index)) }) })
      ] })
    ] }) }),
    hasWarnings && /* @__PURE__ */ jsx8("div", { className: "bg-yellow-50 border border-yellow-200 rounded-md p-4", children: /* @__PURE__ */ jsxs6("div", { className: "flex", children: [
      /* @__PURE__ */ jsx8("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx8("svg", { className: "h-5 w-5 text-yellow-400", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx8("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }) }),
      /* @__PURE__ */ jsxs6("div", { className: "ml-3", children: [
        /* @__PURE__ */ jsx8("h3", { className: "text-sm font-medium text-yellow-800", children: "Warnings" }),
        /* @__PURE__ */ jsx8("div", { className: "mt-2 text-sm text-yellow-700", children: /* @__PURE__ */ jsx8("ul", { className: "list-disc list-inside space-y-1", children: warnings.map((warning, index) => /* @__PURE__ */ jsx8("li", { children: warning }, index)) }) })
      ] })
    ] }) }),
    completeness.missing.length > 0 && /* @__PURE__ */ jsx8("div", { className: "bg-orange-50 border border-orange-200 rounded-md p-4", children: /* @__PURE__ */ jsxs6("div", { className: "flex", children: [
      /* @__PURE__ */ jsx8("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx8("svg", { className: "h-5 w-5 text-orange-400", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx8("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) }) }),
      /* @__PURE__ */ jsxs6("div", { className: "ml-3", children: [
        /* @__PURE__ */ jsx8("h3", { className: "text-sm font-medium text-orange-800", children: "Missing Required Fields" }),
        /* @__PURE__ */ jsx8("div", { className: "mt-2 text-sm text-orange-700", children: /* @__PURE__ */ jsx8("ul", { className: "list-disc list-inside space-y-1", children: completeness.missing.map((field, index) => /* @__PURE__ */ jsx8("li", { children: field }, index)) }) })
      ] })
    ] }) }),
    completeness.suggestions.length > 0 && /* @__PURE__ */ jsx8("div", { className: "bg-gray-50 border border-gray-200 rounded-md p-4", children: /* @__PURE__ */ jsxs6("div", { className: "flex", children: [
      /* @__PURE__ */ jsx8("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx8("svg", { className: "h-5 w-5 text-gray-400", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx8("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) }) }),
      /* @__PURE__ */ jsxs6("div", { className: "ml-3", children: [
        /* @__PURE__ */ jsx8("h3", { className: "text-sm font-medium text-gray-800", children: "Suggestions" }),
        /* @__PURE__ */ jsx8("div", { className: "mt-2 text-sm text-gray-700", children: /* @__PURE__ */ jsx8("ul", { className: "list-disc list-inside space-y-1", children: completeness.suggestions.map((suggestion, index) => /* @__PURE__ */ jsx8("li", { children: suggestion }, index)) }) })
      ] })
    ] }) })
  ] });
};
export {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Input,
  Label,
  Modal,
  ProfileValidation,
  Select,
  ToastProvider,
  useToast
};
