export function fileToBase64(file: Blob | File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}

export async function urlToBase64(url: string): Promise<string> {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const blob = await response.blob();

        return await fileToBase64(blob);
    } catch (error) {
        console.error("Error converting URL to Base64:", error);
        return url;
    }
}
