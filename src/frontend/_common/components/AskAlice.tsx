import React from "react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Mention from "../../main/components/Mention.js";

interface KnowledgeItem {
    keywords: string[];
    response: string;
    action?: string;
}

// api.openprofile.app/v2/assistant
//  {
//      "body": { "Suggest me a character" }
//  }

// ADD
// How to make charcters private and how to access specific settings.
// How does Alice Works
// What is OpenProfile
// How do I interact with others?

const knowledge: KnowledgeItem[] = [
    {
        keywords: ["what", "openprofile"],
        response: "OpenProfile is a free original character database and collaboration platform made by and for writers. It is proclaimed to own the most advanced character profile template in the world and is the first of its kind in what it does.\n\nOpenProfile aims to touch every aspect of character creation through a transparent and source-available application that is free for all.\n\nIt was accidently created in 2017 by AvatarKage, but wasn't publicly published until 2021.",
    },
    {
        keywords: ["free", "openprofile"],
        response: "OpenProfile is 100% free and can be self-hosted. The online version has vanity-based premium features to help support development and keep the platform online, but does not impose limits on what you create, how many people you collaborate with, or how many assets you can own within your account.",
    },
    {
        keywords: ["self-host", "selfhost", "self host", "openprofile"], // Maybe have a auto-trim thing to normalize characters (- _ etc)
        response: "You can self-host OpenProfile by cloning the 'op5' repository from our GitHub. OpenProfile may be hosted internally for both personal and commercial use on private networks, but it must not be exposed to the public internet or used to compete with us. Please review our license before self-hosting.",
    },
    {
        keywords: ["why", "self-host", "selfhost", "self host", "openprofile"],
        response: "Self-hosting OpenProfile provides a NDA secure environment where you and your team can collaborate to create characters.",
    },
    {
        keywords: ["character", "create"],
        response: "You can create a character by pressing the plus button in the navbar.\n\nOr press this quick button below.\n<BUTTON>",
        action: "highlightElement(create)"
    },
    {
        keywords: ["suggest", "character"],
        response: `Based on your reading preferences, I would suggest you **Julia Anderson** by **J9 Studios**.

*"Julia Anderson, also known as Ash, is an American alternative goth patrol officer who specializes in a variety of weapons and deadly martial arts."*

You can read more about her by clicking the link below:
__https://go.openprofile.app/1655391085225720__`,
    },
];

interface Message {
    sender: "ai" | "user";
    text: string;
}

export default function AskAlice() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [messages, setMessages] = useState<Message[]>([
        {
            sender: "ai",
            text: "Hi! I'm Alice. How can I help?",
        },
    ]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });

        if (open && !typing) {
            inputRef.current?.focus();
        }
    }, [messages, typing, open]);


    let highlightFrame: number | null = null;

    function highlightElement(id: string) {
        const element = document.querySelector(`[data-guide="${id}"]`);
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) + 10;
        
        const ring = document.createElement("div");

        Object.assign(ring.style, {
            position: "fixed",
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            border: "4px solid #ce1616",
            background: "rgba(206, 22, 22, 0.15)",
            boxShadow: "0 0 30px 15px rgba(206, 22, 22, 0.45)",
            filter: "blur(1px)",
            zIndex: "999999",
            pointerEvents: "none",
            animation: "ping 1s ease-out infinite",
        });

        document.body.appendChild(ring);

        const follow = () => {
            const r = element.getBoundingClientRect();

            ring.style.left = `${r.left + r.width / 2}px`;
            ring.style.top = `${r.top + r.height / 2}px`;
            ring.style.translate = "-50% -50%";

            highlightFrame = requestAnimationFrame(follow);
        };

        follow();

        setTimeout(() => {
            if (highlightFrame) cancelAnimationFrame(highlightFrame);
            ring.remove();
        }, 3000);
    }
                
    const runAction = (action: string) => {
        const match = action.match(/^(\w+)\((.*)\)$/);
        if (!match) return;

        const [, fn, arg] = match;

        switch (fn) {
            case "highlightElement":
                highlightElement(arg);
                break;
        }
    };

    const getResponse = (question: string): KnowledgeItem => {
        const normalized = question.toLowerCase();

        let bestMatch: KnowledgeItem | null = null;
        let highestScore = 0;

        for (const item of knowledge) {
            let score = 0;

            for (const keyword of item.keywords) {
                if (normalized.includes(keyword.toLowerCase())) {
                    score++;
                }
            }

            if (score > highestScore) {
                highestScore = score;
                bestMatch = item;
            }
        }

        return (
            bestMatch ?? {
                keywords: [],
                response: "I'm sorry, I couldn't find an answer for that yet.",
            }
        );
    };

    const sendMessage = (text: string) => {
        if (!text.trim() || typing) {
            return;
        }

        setMessages((prev) => [
            ...prev,
            {
                sender: "user",
                text
            }
        ]);

        setInput("");
        setTyping(true);

        const { response, action } = getResponse(text);

        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    sender: "ai",
                    text: ""
                }
            ]);

            let index = 0;

            if (action) {
                runAction(action);
            }

            const interval = setInterval(() => {
                index++;

                setMessages((prev) => {
                    const updated = [...prev];

                    updated[updated.length - 1] = {
                        sender: "ai",
                        text: response.slice(0, index),
                    };

                    return updated;
                });

                if (index >= response.length) {
                    clearInterval(interval);
                    setTyping(false);
                }
            }, 20);
        }, 800);
    };

    return (
        <>
            <button
                className="btn btn-accent btn-circle fixed bottom-5 right-5 z-50 h-12 w-12 tooltip tooltip-left tooltip-accent"
                data-tip="Ask Alice"
                onClick={() => setOpen((prev) => !prev)}
            >
                <div className="font-nerdfont text-2xl leading-none">
                    {open ? "" : ""}
                </div>
            </button>

            {open && (
                <div className="fixed bottom-20 right-5 z-50 flex h-142 w-96 flex-col rounded-box border border-base-300 bg-base-100 shadow-2xl animate-[fadeIn_.25s_ease]">
                    <div className="bg-base-200 border-b border-base-300 px-4 py-3">
                        <h2 className="text-lg font-bold">
                            Ask Alice
                        </h2>

                        <p className="text-xs text-base-content/60">
                            Your guide to OpenProfile
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 p-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`
                                    chat animate-[fadeIn_.25s_ease] 
                                    ${message.sender === "ai" ? "chat-start" : "chat-end"}
                                `}
                            >
                                <div className="chat-image avatar">
                                    <div className="w-10 rounded-full">
                                        <img
                                            src={
                                                message.sender === "ai"
                                                    ? "https://cdn.openprofile.app/uploads/users/0000000000000000/0000000000000000.png"
                                                    : "https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/mp4vq9qxv51.png"
                                            }
                                            alt={message.sender === "ai" ? "Alice" : "AvatarKage"}
                                        />
                                    </div>
                                </div>

                                <div className="chat-header mb-1 text-xs opacity-60">
                                    {message.sender === "ai" ? "Alice" : "AvatarKage"}
                                </div>

                                <div
                                    className={`
                                        chat-bubble text-sm whitespace-pre-line
                                        ${message.sender === "ai" ? "chat-bubble-accent" : "chat-bubble-secondary"}
                                    `}
                                >
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p({ children }) {
                                                return (
                                                    <p>
                                                        {React.Children.map(children, (child) => {
                                                            if (!React.isValidElement(child)) {
                                                                if (typeof child !== "string") return child;

                                                                const parts = child.split(/(<BUTTON>|<@[A-Za-z0-9_-]+>)/g);

                                                                return parts.map((part, index) => {
                                                                    const mentionMatch = part.match(/^<@([A-Za-z0-9_-]+)>$/);
                                                                    if (mentionMatch) {
                                                                        return (
                                                                            <Mention
                                                                                key={index}
                                                                                id={mentionMatch[1]}
                                                                                name="Cornelia"
                                                                                avatar="https://cdn.openprofile.app/uploads/profiles/6773794953695671/4k2jGxq2utoquol17wG9HZ54LgLTUfVc.png"
                                                                                aura={{
                                                                                    isEnabled: true,
                                                                                    primary: "#fce1969f",
                                                                                }}
                                                                                verified
                                                                                inline
                                                                            />
                                                                        );
                                                                    }

                                                                    if (part === "<BUTTON>") {
                                                                        return (
                                                                            <button
                                                                                key={index}
                                                                                className="btn btn-accent border border-white mt-2 w-full"
                                                                                onClick={() => console.log("Clicked!")}
                                                                                >
                                                                                Create Character
                                                                            </button>
                                                                        );
                                                                    }

                                                                    return part;
                                                                });
                                                            }

                                                            return child;
                                                        })}
                                                    </p>
                                                );
                                            },

                                            a({ href, children }) {
                                                return (
                                                    <a
                                                        className="text-white font-normal underline"
                                                        href={href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {children}
                                                    </a>
                                                );
                                            },
                                        }}
                                        >
                                        {message.text}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="bg-base-200 border-t border-base-300 p-3">
                        <div className="join w-full">
                            <input
                                ref={inputRef}
                                className="input join-item flex-1"
                                disabled={typing}
                                value={input}
                                onChange={(e) =>
                                    setInput(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        sendMessage(input);
                                    }
                                }}
                                placeholder="Ask Alice..."
                            />

                            <button
                                className="btn btn-primary join-item font-nerdfont text-xl leading-none"
                                disabled={typing}
                                onClick={() => sendMessage(input)}
                            >
                                󰒊
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}