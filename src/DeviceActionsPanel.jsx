import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DeviceActionsPanel = ({ isOpen, onClose, deviceId, deviceName }) => {
    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(false);

    // هربار که پاپ‌آپ باز می‌شود و شناسه دستگاه تغییر می‌کند، دستورات جدید را از بک‌اند می‌گیرد
    useEffect(() => {
        if (isOpen && deviceId) {
            fetchActions();
        }
    }, [isOpen, deviceId]);

    const fetchActions = async () => {
        setLoading(true);
        try {
            // آدرس API بک‌اندمان که در مرحله قبل ساختیم
            const response = await axios.get(`/api/device-actions/device/${deviceId}`);
            setActions(response.data);
        } catch (error) {
            console.error("خطا در دریافت لیست دستورات:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async (actionId) => {
        try {
            await axios.post(`/api/device-actions/${actionId}/test`);
            alert("دستور با موفقیت ارسال و تست شد!");
        } catch (error) {
            console.error("خطا در تست دستور:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-4xl rounded-2xl bg-[#0e131f] border border-slate-800/80 p-8 text-slate-200 shadow-2xl dir-rtl">

                {/* هدر */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-violet-400 text-xl">⚙️</span>
                        <h2 className="text-lg font-bold">
                            دستورات ذخیره شده ({actions.length}) - دستگاه <span className="text-violet-400">{deviceName}</span>
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
                </div>

                {/* لیست دستورات شبیه به عکس شما */}
                {loading ? (
                    <div className="text-center py-12 text-slate-500">در حال بارگذاری دستورات...</div>
                ) : actions.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-slate-850 rounded-xl text-slate-500">
                        هیچ دستوری برای این دستگاه ثبت نشده است.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                        {actions.map((action) => (
                            <div
                                key={action.id}
                                className="flex items-center justify-between bg-[#192235]/60 hover:bg-[#192235]/90 border border-slate-800/60 rounded-xl p-5 transition-all duration-200"
                            >
                                {/* دکمه تست در سمت چپ کارت */}
                                <button
                                    onClick={() => handleTest(action.id)}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-semibold transition-all"
                                >
                                    <span>تست</span>
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                </button>

                                {/* اطلاعات و آیکون در سمت راست کارت */}
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <h4 className="font-semibold text-[15px] text-slate-100 mb-1">{action.name}</h4>
                                        <span className="text-xs text-slate-500 font-mono tracking-wider">{action.protocol}</span>
                                    </div>
                                    <div className="text-slate-500 bg-slate-800/30 p-2.5 rounded-lg">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default DeviceActionsPanel;