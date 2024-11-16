// place files you want to import through the `$lib` alias in this folder.
import * as books from '@sebas/open-book-api';

function downloadFileFromLink(href: string): void {
	// Create an anchor (<a>) element
	const link = document.createElement('a');
	link.href = href;

	// Programmatically click the link to trigger the download
	link.click();
}
async function downloadFileFromID(id: string, type: 'book' | 'article', title: string): Promise<boolean> {
	// Create an anchor (<a>) element
	const result = await fetch('/api/download', { method: 'POST', body: JSON.stringify({ id, type }) });
	const dl = await result.json();

	// Fetch the actual file content from the URL
	const fileResponse = await fetch("https://corsproxy.io/?" + encodeURIComponent(dl.result?.url));
	const fileBlob = await fileResponse.blob();

	// Create blob URL for the downloaded file
	const blobUrl = URL.createObjectURL(fileBlob);

	// Create download link
	const link = document.createElement('a');
	link.href = blobUrl;
	link.toggleAttribute('download');

	// Set filename with correct extension
	const extension = dl.result?.url.split('.').pop() ?? null;
	const cleanFilename = title.replaceAll(' ', '_');

	if (extension) {
		link.download = `${cleanFilename}.${extension}`;
	}

	// Programmatically click the link to trigger the download
	link.click();

	// Clean up the blob URL after download starts
	URL.revokeObjectURL(blobUrl);

	return true;
}

export { books, downloadFileFromLink, downloadFileFromID };
