import React from "react";

interface SpinnerProps {
	size?: number;
	color?: string;
	className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 40, color = "#3498db", className }) => {
	return (
		<div
			className={className}
			style={{
				display: "inline-block",
				width: size,
				height: size,
			}}
		>
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				style={{ display: "block" }}
			>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={(size / 2) - 5}
					stroke={color}
					strokeWidth="4"
					fill="none"
					strokeDasharray={Math.PI * (size - 10)}
					strokeDashoffset={Math.PI * (size - 10) * 0.25}
				>
					<animateTransform
						attributeName="transform"
						type="rotate"
						from={`0 ${size / 2} ${size / 2}`}
						to={`360 ${size / 2} ${size / 2}`}
						dur="1s"
						repeatCount="indefinite"
					/>
				</circle>
			</svg>
		</div>
	);
};

export default Spinner;
