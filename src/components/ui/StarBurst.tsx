'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface StarBurstProps {
  visible: boolean;
  stars?: number; // 1-3
}

export function StarBurst({ visible, stars = 3 }: StarBurstProps) {
  const starArray = Array.from({ length: stars }, (_, i) => i);

  return (
    <AnimatePresence>
      {visible && (
        <div className="flex justify-center gap-3 my-4">
          {starArray.map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ delay: i * 0.15, type: 'spring', stiffness: 300 }}
              className="text-5xl"
            >
              ⭐
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
