import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

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
	const imageContainerRef = useRef(null);

	useEffect(() => {
		if (!open) return;
		const handleKeyDown = (e) => {
			if (e.key === 'Escape') onClose();
			if (type === 'image') {
				if (e.key === '+' || e.key === '=') {
					e.preventDefault();
					setImageScale && setImageScale(s => Math.min(s + 0.1, 3));
				}
				if (e.key === '-' || e.key === '_') {
					e.preventDefault();
					setImageScale && setImageScale(s => Math.max(s - 0.1, 0.2));
				}
				if (e.key === 'r' || e.key === 'R') {
					setImageRotation && setImageRotation(r => (r + 90) % 360);
				}
				if (e.key === '0') {
					e.preventDefault();
					setImageScale && setImageScale(1);
					setImageRotation && setImageRotation(0);
				}
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [open, type, setImageScale, setImageRotation, onClose]);

	if (!open || !attachment) return null;

	// Get file URL
	const url = attachment.downloadUrl || attachment.url || attachment.previewUrl;
	const fileName = attachment.originalName || attachment.fileName || attachment.name || 'Attachment';

	const handleReset = () => {
		setImageScale && setImageScale(1);
		setImageRotation && setImageRotation(0);
	};

	// Render preview content
	let content = null;
	let modalHeightClass = 'max-h-[95vh]'; // Default for PDF and text
	
	if (type === 'image') {
		modalHeightClass = ''; // Remove fixed height for images - let content determine it
		content = (
			<div className="flex flex-col items-center w-full">
				<div 
					ref={imageContainerRef}
					className="relative flex items-center justify-center overflow-auto w-full mb-4 bg-gray-50 rounded"
					style={{ maxHeight: 'calc(95vh - 180px)' }} // Account for header + controls + padding
				>
					<img
						src={url}
						alt={fileName}
						style={{
							transform: `scale(${imageScale}) rotate(${imageRotation}deg)`,
							transformOrigin: 'center',
							transition: 'transform 0.2s ease-out'
						}}
						className="max-w-full max-h-full object-contain"
					/>
				</div>
				<div className="flex flex-wrap gap-2 items-center justify-center bg-white px-2 py-2 rounded-lg shadow-sm border border-gray-200">
					<button 
						onClick={() => setImageScale && setImageScale(s => Math.max(s - 0.1, 0.2))} 
						className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
						title="Zoom out (-)"
					>
						−
					</button>
					<span className="px-2 text-sm font-medium text-gray-700 min-w-[80px] text-center">
						{(imageScale * 100).toFixed(0)}%
					</span>
					<button 
						onClick={() => setImageScale && setImageScale(s => Math.min(s + 0.1, 3))} 
						className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
						title="Zoom in (+)"
					>
						+
					</button>
					<div className="w-px h-6 bg-gray-300 mx-1"></div>
					<button 
						onClick={() => setImageRotation && setImageRotation(r => (r + 90) % 360)} 
						className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
						title="Rotate (R)"
					>
						⟳
					</button>
					<button 
						onClick={handleReset} 
						className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
						title="Reset (0)"
					>
						Reset
					</button>
				</div>
			</div>
		);
	} else if (type === 'pdf') {
		content = (
			<iframe
				src={url}
				title={fileName}
				className="w-full bg-white rounded"
				style={{ height: 'calc(95vh - 120px)' }}
				frameBorder="0"
			/>
		);
	} else if (type === 'text') {
		content = (
			<iframe
				src={url}
				title={fileName}
				className="w-full bg-white rounded"
				style={{ height: 'calc(95vh - 120px)' }}
				frameBorder="0"
			/>
		);
	} else {
		modalHeightClass = ''; // Let content determine height
		content = (
			<div className="text-center text-gray-600 p-8">
				<div className="text-4xl mb-4">📄</div>
				<div>Preview not available for this file type.</div>
			</div>
		);
	}

	const modalElement = (
		<div
			className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70 p-2 sm:p-4"
			style={{ 
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				margin: 0,
				zIndex: 9999
			}}
			tabIndex={-1}
			ref={modalRef}
			onClick={e => { if (e.target === modalRef.current) onClose(); }}
		>
			<div className={`relative bg-white rounded-lg shadow-2xl w-full max-w-6xl ${modalHeightClass} flex flex-col overflow-hidden`}>
				<div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white flex-shrink-0">
					<h2 className="font-semibold text-gray-800 text-sm sm:text-base md:text-lg truncate flex-1 pr-4">
						{fileName}
					</h2>
					<button
						onClick={onClose}
						className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full text-2xl font-bold focus:outline-none transition-colors"
						aria-label="Close preview"
					>
						×
					</button>
				</div>
				<div className="p-3 sm:p-4 md:p-6">
					{content}
				</div>
			</div>
		</div>
	);

	// Use portal to render modal directly to document.body
	return createPortal(modalElement, document.body);
}

// Demo component to test the modal
function Demo() {
	const [open, setOpen] = React.useState(false);
	const [imageScale, setImageScale] = React.useState(1);
	const [imageRotation, setImageRotation] = React.useState(0);
	const [currentType, setCurrentType] = React.useState('image');
	const [currentAttachment, setCurrentAttachment] = React.useState(null);

	const samples = {
		image: {
			url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
			originalName: 'beautiful-landscape.jpg'
		},
		smallImage: {
			url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300',
			originalName: 'small-image.jpg'
		},
		pdf: {
			url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
			originalName: 'sample-document.pdf'
		}
	};

	const openModal = (type, attachment) => {
		setCurrentType(type);
		setCurrentAttachment(attachment);
		setOpen(true);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-3xl font-bold text-gray-800 mb-6">Responsive Preview Modal</h1>
				<div className="space-y-3 mb-6">
					<button
						onClick={() => openModal('image', samples.image)}
						className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg transition-colors"
					>
						Large Image Preview
					</button>
					<button
						onClick={() => openModal('image', samples.smallImage)}
						className="block w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-lg transition-colors"
					>
						Small Image Preview
					</button>
					<button
						onClick={() => openModal('pdf', samples.pdf)}
						className="block w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-lg transition-colors"
					>
						PDF Preview
					</button>
				</div>
				<div className="mt-6 text-sm text-gray-600 max-w-md mx-auto">
					<p className="font-semibold mb-2">Keyboard shortcuts (images):</p>
					<ul className="text-left space-y-1">
						<li>• <kbd className="px-2 py-0.5 bg-white rounded border">+</kbd> / <kbd className="px-2 py-0.5 bg-white rounded border">-</kbd> - Zoom in/out</li>
						<li>• <kbd className="px-2 py-0.5 bg-white rounded border">R</kbd> - Rotate</li>
						<li>• <kbd className="px-2 py-0.5 bg-white rounded border">0</kbd> - Reset</li>
						<li>• <kbd className="px-2 py-0.5 bg-white rounded border">Esc</kbd> - Close</li>
					</ul>
				</div>
			</div>

			<AttachmentPreviewModal
				open={open}
				onClose={() => {
					setOpen(false);
					setImageScale(1);
					setImageRotation(0);
				}}
				attachment={currentAttachment}
				type={currentType}
				imageScale={imageScale}
				setImageScale={setImageScale}
				imageRotation={imageRotation}
				setImageRotation={setImageRotation}
			/>
		</div>
	);
}