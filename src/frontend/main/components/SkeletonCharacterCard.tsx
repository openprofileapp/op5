export default function SkeletonCharacterCard() {
    return (
        <div className="character-card flex w-52 flex-col gap-4"
            style={{ backgroundColor: "#00000000" }}    
        >
            <div className="skeleton h-55 w-full"></div>
            <div className="skeleton rounded-full h-4 w-full"></div>
            <div className="skeleton rounded-full h-4 w-full"></div>
            <div className="skeleton rounded-full h-4 w-full"></div>
            <div className="skeleton rounded-full h-4 w-full"></div>
            <div className="flex gap-4">
                <div className="skeleton rounded-full h-8 w-1/2"></div>
                <div className="skeleton rounded-full h-8 w-1/2"></div>
            </div>
        </div>
    );
}