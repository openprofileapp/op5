import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type Asset = {
    id: string;
    aura?: {
        start: string;
        end: string;
    };
    avatar?: string;
    name?: string;
    slug?: string;
    verified?: boolean;
};

export default function Mention({
    id,
    aura,
    avatar,
    name,
    slug,
    verified
}: Asset) {
    const { ready } = useTranslation();

    if (!ready) return null;

    const auraStyle = aura
        ? {
              ["--aura-mention-start" as string]:
                  aura.start || "var(--color-accent)",

              ["--aura-mention-end" as string]:
                  aura.end || "var(--color-accent)",
          }
        : {
              border: "1px solid #222222",
          };

    {/* Url for images are only cdn slugs, not the domain. Fix code below */}

    if (!id) {
        return;
    }

    return (
        <div className="flex items-center justify-center">
            <div className="mention" style={auraStyle}>
                <Link className="z-1 link-hover flex items-center justify-center gap-2 text-xs leading-none min-w-0"
                    to={`/${slug || id}`}
                >
                    <img className="rounded-full h-4 w-4 flex-shrink-0" src={avatar} alt="avatar" />

                    <span className="truncate min-w-0">
                        {name || id}
                    </span>
                </Link>

                { verified ?
                    <div className="z-1 relative tooltip font-normal tooltip-top tooltip-accent" 
                        data-tip="Official">
                        <a href={`https://${window.config.domains.support}/en-us/articles/verification`}>
                            <svg className="text-accent" width="15" height="15" viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg"><path d="m6.387.375.876.876h1.24c.69 0 1.25.56 1.25 1.25v1.24l.876.875a1.25 1.25 0 0 1 0 1.768l-.876.876V8.5c0 .69-.56 1.25-1.25 1.25h-1.24l-.876.876a1.25 1.25 0 0 1-1.768 0l-.876-.876H2.504c-.69 0-1.25-.56-1.25-1.25V7.26l-.876-.876a1.25 1.25 0 0 1 0-1.768l.876-.876V2.501c0-.69.56-1.25 1.25-1.25h1.24l.875-.876a1.25 1.25 0 0 1 1.768 0" fill="currentColor"/><path d="M5.185 7.238 7.925 4.5a.54.54 0 0 0 .156-.38.5.5 0 0 0-.155-.37.5.5 0 0 0-.37-.154.45.45 0 0 0-.357.166L4.815 6.143l-1.013-1a.5.5 0 0 0-.37-.166q-.214 0-.357.166-.155.143-.155.357 0 .215.155.357l1.383 1.381a.5.5 0 0 0 .357.143.53.53 0 0 0 .37-.143" fill="#ffffff"/></svg>
                        </a> 
                    </div>

                    : ""
                }
            </div>
        </div>
    );
}