import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type Character = {
    id: string;
    aura?: {
        start: string;
        end: string;
    };
    avatar?: string;
    name?: string;
    overview?: string;
};

export default function CharacterCard({
    id,
    aura,
    avatar,
    name,
    overview
}: Character) {
    const { ready } = useTranslation();

    if (!ready) return null;

    const auraStyle = aura
        ? {
              ["--aura-start" as string]:
                  aura.start || "var(--color-base-100)",

              ["--aura-end" as string]:
                  aura.end || "var(--color-base-100)",
          }
        : {
              border: "1px solid #222222",
          };

    {/* Move initial as a seperate component for users and projects */}
    let initials;

    if (!avatar) {
        initials = name
            ? name
                .split(" ")
                .map(word => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : id?.toString().slice(0, 2) || "";
    }

    return (
        <div
            className="card-tall relative p-4 shadow-sm"
            style={auraStyle}
        >

            <div className="absolute top-[-5px] right-[-5px] z-10 tooltip tooltip-bottom tooltip-accent" 
                data-tip="Updated 5 minutes ago">
                <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-50" />
                <div className="relative rounded-full bg-accent w-5 h-5" />
            </div>

            {avatar ? (
                <img
                    className="absolute top-0 left-0 rounded-t-lg w-full object-cover"
                    src={avatar}
                    alt="avatar"
                    style={{
                        maskImage:
                            "linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 90%)",
                        WebkitMaskImage:
                            "linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 90%)",
                    }}
                />
            ) : (
                <div className="absolute top-0 left-0 w-full h-[200px] flex items-center justify-center text-8xl font-thin">
                    {initials}
                </div>
            )}

            <div className="relative top-46 flex flex-col h-46 w-full gap-1">
                <Link className="link-hover font-bold text-center" to="/dragonights/character/eclipse">{name || id || "Error loading profile..."}</Link>                    
                <div className="text-center text-sm">
                    <Link className="link-hover" to="/dragonights">{"Dragonights"}</Link>                    
                    <div className="relative tooltip font-normal tooltip-top tooltip-accent pb-2" 
                        data-tip="Official">
                        <div className="relative rounded-full bg-accent w-4 h-4 ml-1"><span className="font-nerdfont text-xs flex items-center justify-center"></span></div>
                    </div>
                </div>
                <div className="text-xs line-clamp-4">{overview || "This character does not have an overview."}</div>            
                <div className="text-xs text-center mt-2">00 500 | 00 500</div>            
            </div>
        </div>
    );
}