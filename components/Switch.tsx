// components/Switch.tsx
"use client";

import React from "react";
//import './Switch.css'
//import './SwitchDiv.css'
//            <h2>{text}</h2>

const Switch = ({
	isToggled,
	onToggle,
}: {
	isToggled: boolean;
	onToggle: () => void;
}) => {
	return (
		<label className="relative inline-flex cursor-pointer items-center">
			<input
				type="checkbox"
				value=""
				checked={isToggled}
				onChange={onToggle}
				className="peer sr-only"
			/>
			<div className="after: peer flex h-8 items-center gap-4 rounded-full px-3 text-sm text-white after:absolute after:left-1 after:size-6 after:rounded-full after:bg-white/40 after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-focus:outline-none dark:border-slate-600 dark:bg-slate-700">
				<span className="w-8"></span>
			</div>
		</label>
	);
};

export default Switch;

/*export default function Switch() {
    

  return (
    <div>
    <input type="checkbox" name="name" id="id"/>
    <label>
    </label>
    </div>
  );
}
/*function switchFeature({text}){
    return(
        <p>${text}</p>
    )
}*/
