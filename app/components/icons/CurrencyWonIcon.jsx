"use strict";
"use client";

const CurrencyWonIcon = function ({ className }) {
    console.log("Check : ", className)
    return (
        <div className={className}>
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="#555555">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8 M6.08 8.5 l2 9 h2.52 l1.41 -6.36 l1.41 6.36 h2.52 l2 -9 h-1.84 l-1.41 6.36 l-1.41 -6.36 h-2.52 l-1.41 6.36 l-1.41 -6.36 M5 12.5 h14 v-1.8 h-14 M5 15 h14 v-1.8 h-14" />
            </svg>
        </div>
    )
}

export default CurrencyWonIcon;