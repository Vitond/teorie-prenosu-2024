import React from "react";
import "./ValueDisplay.css"

export const ValueDisplay: React.FC<{label: string, value: number | string}> = ({value, label}) => {
    return <div className="ValueDisplay">
        {value}
        <div className="ValueDisplay__label">
            {label}
        </div>
    </div>
}

export default ValueDisplay;