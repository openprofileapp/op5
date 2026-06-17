import QRCodeStyling from "qr-code-styling";

type Props = {
    format?: "png" | "svg";
    transparent?: boolean;
};

export async function generateQrCode(
    text: string,
    {
        format = "svg",
        transparent = false,
    }: Props = {}
): Promise<string | undefined> {
    if (!text) return;

    const upscale = 1;
    const targetSize = 1024;
    const highResSize = targetSize * upscale;
    const margin = 60 * upscale;

    const dotsColor = "#ffffff";
    const bgColor = transparent ? "#00000000" : "#080808";

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const qrCode = new QRCodeStyling({
        width: highResSize,
        height: highResSize,
        data: text,
        margin,
        dotsOptions: {
            color: dotsColor,
            type: "dots",
        },
        backgroundOptions: {
            color: bgColor,
        },
        imageOptions: {
            crossOrigin: "anonymous",
            margin: 40 * upscale,
            hideBackgroundDots: true,
        },
        image: `https://${window.config.domains.cdn}/branding/logo.svg`,
        cornersSquareOptions: {
            type: "dot",
            color: dotsColor,
        },
        cornersDotOptions: {
            type: "dot",
            color: dotsColor,
        },
    });

    if (format === "png") {
        const blob = await qrCode.getRawData("png");
        if (!blob) return;

        const img = new Image();
        const objectUrl = URL.createObjectURL(blob);

        img.src = objectUrl;

        return await new Promise<string>((resolve, reject) => {
            img.onload = () => {
                try {
                    const canvas = document.createElement("canvas");
                    canvas.width = targetSize;
                    canvas.height = targetSize;

                    const ctx = canvas.getContext("2d");
                    if (!ctx) return reject("No canvas context");

                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = "high";
                    ctx.drawImage(img, 0, 0, targetSize, targetSize);

                    canvas.toBlob((finalBlob) => {
                        if (!finalBlob) return reject("No blob");

                        const url = URL.createObjectURL(finalBlob);

                        URL.revokeObjectURL(objectUrl);

                        resolve(url);
                    }, "image/png");
                } catch (e) {
                    reject(e);
                }
            };

            img.onerror = reject;
        });
    }

    if (format === "svg") {
        const svg = await qrCode.getRawData("svg");
        if (!svg) return;

        const blob = new Blob([svg], { type: "image/svg+xml" });
        return URL.createObjectURL(blob);
    }

    return;
}