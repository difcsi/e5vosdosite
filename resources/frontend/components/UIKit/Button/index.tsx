import React from "react";

const Button = ({
    variant = "primary",
    type = "button",
    children,
    className,
    ...rest
}: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
> & {
    variant?:
        | "primary"
        | "outline-primary"
        | "secondary"
        | "outline-secondary"
        | "danger"
        | "outline-danger"
        | "success"
        | "outline-success"
        | "warning"
        | "outline-warning"
        | "info"
        | "outline-info";
}) => {
    if (type === "submit" && !variant) variant = "success";

    let buttonclass = "outline outline-2 outline-offset-0  ";
    switch (variant) {
        case "primary":
            buttonclass +=
                "bg-blue-400 outline-blue-400 enabled:hover:bg-blue-700 disabled:bg-blue-700 text-white enabled:hover:text-white disabled:text-white ";
            break;
        case "outline-primary":
            buttonclass +=
                "outline-blue-400 enabled:hover:bg-blue-400 disabled:bg-blue-700 text-white";
            break;
        case "secondary":
            buttonclass +=
                "bg-white outline-white enabled:hover:bg-gray-600 disabled:bg-gray-600 text-black enabled:hover:text-white disabled:text-white";
            break;
        case "outline-secondary":
            buttonclass +=
                " outline-white enabled:hover:bg-white disabled:bg-white text-white enabled:hover:text-black disabled:text-black";
            break;
        case "danger":
            buttonclass +=
                "bg-red-500 outline-red-500 enabled:hover:bg-red-700 disabled:bg-red-700 text-white enabled:hover:text-white disabled:text-white";
            break;
        case "outline-danger":
            buttonclass +=
                "outline-red enabled:hover:bg-red disabled:bg-red text-white enabled:hover:text-white disabled:text-white";
            break;
        case "success":
            buttonclass +=
                "bg-green outline-green enabled:hover:bg-green-700 disabled:bg-green-700 text-black enabled:hover:text-white disabled:text-white";
            break;
        case "outline-success":
            buttonclass +=
                "outline-green enabled:hover:bg-green disabled:bg-green text-white enabled:hover:text-black disabled:text-black";
            break;
        case "warning":
            buttonclass +=
                "bg-goldenrod outline-goldenrod enabled:hover:bg-goldenrod-700 disabled:bg-goldenrod-700 text-black enabled:hover:text-white disabled:text-white";
            break;
        case "outline-warning":
            buttonclass +=
                "outline-goldenrod enabled:hover:bg-goldenrod disabled:bg-godlenrod text-white enabled:hover:text-black disabled:text-black";
            break;
        case "info":
            buttonclass +=
                "bg-blue-600 outline-blue-600 enabled:hover:bg-blue-700 disabled:bg-blue-700 text-white enabled:hover:text-white disabled:text-white";
            break;
        case "outline-info":
            buttonclass +=
                "outline-blue-600 enabled:hover:bg-blue-600 disabled:bg-blue text-white enabled:hover:text-white disabled:text-white";
            break;
        default:
    }

    return (
        <button
            {...rest}
            type={type}
            className={`rounded px-4 py-2 font-semibold ${buttonclass} ${
                className ?? ""
            }`}
        >
            {children}
        </button>
    );
};
export default Button;
