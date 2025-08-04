"use client";
import React from "react";

const BoardInterviewPage = () => {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#18191c',
            color: 'white',
            padding: 24,
            fontFamily: 'monospace',
            boxSizing: 'border-box'
        }}>
            <div style={{
                border: '2px solid #aaa',
                borderRadius: 8,
                padding: 8,
                margin: '0 auto',
                maxWidth: 900,
                background: 'rgba(30,30,30,0.95)'
            }}>
                <div style={{ border: '1px solid #aaa', borderRadius: 4, padding: 8, marginBottom: 8, textAlign: 'center' }}>
                    LAYOUT OVERLAY....
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {/* Left column: bot overlay + end interview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ border: '1px solid #aaa', borderRadius: 4, padding: 8, width: 100, height: 60, textAlign: 'center', fontSize: 12 }}>
                            BOT OVERLAY<br />FACE
                        </div>
                        <button style={{
                            border: '1px solid #aaa',
                            borderRadius: 4,
                            padding: '8px 12px',
                            marginTop: 8,
                            background: '#222',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: 13
                        }}>
                            END INTERVIEW
                        </button>
                    </div>
                    {/* Center: video feed */}
                    <div style={{
                        flex: 1,
                        border: '1px solid #aaa',
                        borderRadius: 4,
                        minHeight: 260,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        marginRight: 8
                    }}>
                        VIDEO_FEED...FROM...CAMERA
                    </div>
                    {/* Right: conversation */}
                    <div style={{
                        width: 260,
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid #aaa',
                        borderRadius: 4,
                        minHeight: 260,
                        padding: 0
                    }}>
                        <div style={{
                            borderBottom: '1px solid #aaa',
                            padding: 8,
                            textAlign: 'center',
                            fontSize: 14
                        }}>
                            CONVERSATION
                        </div>
                        <div style={{ flex: 1 }} />
                        <div style={{
                            borderTop: '1px solid #aaa',
                            padding: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}>
                            <input
                                type="text"
                                placeholder="TYPING"
                                style={{
                                    flex: 1,
                                    background: '#222',
                                    color: 'white',
                                    border: '1px solid #555',
                                    borderRadius: 4,
                                    padding: '6px 10px',
                                    fontSize: 13
                                }}
                                disabled
                            />
                            <span style={{ fontSize: 18, opacity: 0.7 }}>🎤</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoardInterviewPage;
