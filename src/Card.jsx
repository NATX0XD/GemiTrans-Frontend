// src/components/RightPanel/Card.jsx
import React from 'react';
import { Clock, Star, AudioLines } from 'lucide-react';
import { Reorder } from 'framer-motion';

export default function Card({ event }) {
    // กระจายค่าออกจาก event object
    const { type, date, title, time, bgColor, borderStyle, userPic } = event;

    return (
        // เปลี่ยน div เป็น Reorder.Item
        <Reorder.Item
            value={event}
            id={event.id}
            // แอนิเมชันตอนเริ่มโหลด (เด้งขึ้นมาทีละอันแบบนุ่มๆ)
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            // แอนิเมชันตอนถูกลาก (ขยายร่างขึ้น 5% และลอยขึ้นมาเหนือการ์ดอื่น)
            whileDrag={{
                scale: 1.05,
                boxShadow: "0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)",
                cursor: "grabbing"
            }}
            // เปลี่ยน cursor ให้เป็นรูปมือจับ
            className={`${bgColor} ${borderStyle || ''} rounded-[24px] p-5 relative cursor-grab`}
        >
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    {userPic ? (
                        <img src={userPic} alt="User" className="w-6 h-6 rounded-full border border-white pointer-events-none" />
                    ) : type === 'Task' ? (
                        <Star className="w-4 h-4 text-gray-700" />
                    ) : (
                        <AudioLines className="w-4 h-4 text-gray-700" />
                    )}
                    <span className="text-sm font-semibold text-gray-900">{type}</span>
                </div>
                <span className="text-xs font-medium text-gray-500">{date}</span>
            </div>

            <p className="text-sm text-gray-800 font-medium leading-relaxed mb-4 pointer-events-none">
                {title}
            </p>

            {time && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 bg-white/60 w-max px-3 py-1.5 rounded-full pointer-events-none">
                    <Clock className="w-3.5 h-3.5" />
                    {time}
                </div>
            )}
        </Reorder.Item>
    );
}