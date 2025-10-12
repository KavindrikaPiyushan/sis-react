import React, { useEffect, useRef } from 'react';

export default function AttachmentPreviewModal({
	open,
	onClose,
	attachment,
	type,
	imageScale = 1,
	setImageScale,
	imageRotation = 0,
	setImageRotation
}) {
	const modalRef = useRef(null);

	useEffect(() => {
		if (!open) return;
		const handleKeyDown = (e) => {
			if (e.key === 'Escape') onClose();
			if (type === 'image') {
				if (e.key === '+') setImageScale && setImageScale(s => Math.min(s + 0.1, 3));
				if (e.key === '-') setImageScale && setImageScale(s => Math.max(s - 0.1, 0.2));
				if (e.key === 'r' || e.key === 'R') setImageRotation && setImageRotation(r => (r + 90) % 360);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [open, type, setImageScale, setImageRotation]);

	if (!open || !attachment) return null;

	// Get file URL
	const url = attachment.downloadUrl || attachment.url || attachment.previewUrl;
	const fileName = attachment.originalName || attachment.fileName || attachment.name || 'Attachment';

	// Render preview content
	let content = null;
	if (type === 'image') {
		content = (
			<div className="flex flex-col items-center">
				<img
					src={url}
					alt={fileName}
					style={{
						maxWidth: '80vw',
						maxHeight: '70vh',
						transform: `scale(${imageScale}) rotate(${imageRotation}deg)`
					}}
					className="rounded shadow-lg bg-white"
				/>
				<div className="flex gap-2 mt-4">
					<button onClick={() => setImageScale && setImageScale(s => Math.max(s - 0.1, 0.2))} className="px-2 py-1 bg-gray-200 rounded">-</button>
					<span className="px-2">Zoom: {(imageScale * 100).toFixed(0)}%</span>
					<button onClick={() => setImageScale && setImageScale(s => Math.min(s + 0.1, 3))} className="px-2 py-1 bg-gray-200 rounded">+</button>
					<button onClick={() => setImageRotation && setImageRotation(r => (r + 90) % 360)} className="px-2 py-1 bg-gray-200 rounded">⟳ Rotate</button>
				</div>
			</div>
		);
	} else if (type === 'pdf') {
		content = (
			<iframe
				src={url}
				title={fileName}
				className="w-[80vw] h-[70vh] bg-white rounded shadow-lg"
				frameBorder="0"
			/>
		);
	} else if (type === 'text') {
		content = (
			<iframe
				src={url}
				title={fileName}
				className="w-[80vw] h-[70vh] bg-white rounded shadow-lg"
				frameBorder="0"
			/>
		);
	} else {
		content = (
			<div className="text-center text-gray-600">Preview not available for this file type.</div>
		);
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
			tabIndex={-1}
			ref={modalRef}
			onClick={e => { if (e.target === modalRef.current) onClose(); }}
		>
			<div className="relative bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full flex flex-col items-center">
				<button
					onClick={onClose}
					className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl font-bold focus:outline-none"
					aria-label="Close preview"
				>
					×
				</button>
				<div className="mb-2 font-semibold text-gray-800 text-lg truncate w-full text-center">{fileName}</div>
				{content}
			</div>
		</div>
	);
}
