import React from 'react';
import { motion } from 'framer-motion';
import { ClickStatus } from '@shared/types';
import { INDICATOR_STATES } from '@shared/constants';

interface Props {
  status: ClickStatus;
}

export const Indicator: React.FC<Props> = ({ status }) => {
  const preset = INDICATOR_STATES[status.state] ?? INDICATOR_STATES.idle;
  return (
    <motion.div
      className="indicator"
      style={{ backgroundColor: preset.color }}
      animate={{ scale: status.state === 'active' ? 1.03 : 1, opacity: 1 }}
      transition={{ repeat: status.state === 'active' ? Infinity : 0, repeatType: 'reverse', duration: 0.6 }}
    >
      <div className="indicator__state">{preset.label}</div>
      <div className="indicator__message">{status.message ?? 'Ready'}</div>
      {typeof status.runTimeSeconds === 'number' && (
        <div className="indicator__timer">{status.runTimeSeconds}s</div>
      )}
    </motion.div>
  );
};
