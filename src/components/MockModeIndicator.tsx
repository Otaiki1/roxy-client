import { motion } from "framer-motion";
import { LuZap as Zap } from "react-icons/lu";
import { useMockMode } from "@/hooks/useMockMode";

export function MockModeIndicator() {
    const { enabled } = useMockMode();

    if (!enabled) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 right-4 z-50 bg-primary text-black px-4 py-2 border-2 border-primary flex items-center gap-2 font-brutal text-sm"
        >
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
            >
                <Zap size={16} />
            </motion.div>
            <span>MOCK MODE</span>
        </motion.div>
    );
}

