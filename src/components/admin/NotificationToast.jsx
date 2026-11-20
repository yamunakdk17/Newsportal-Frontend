import { AnimatePresence, motion } from 'framer-motion';

function NotificationToast({ notification, reduce }) {
  const isError = notification?.type === 'error';

  return (
    <AnimatePresence>
      {notification?.message && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          className={`flex w-full items-start justify-between gap-3 rounded-xl border bg-white px-3 py-2 shadow-sm ${
            isError
              ? 'border-red-200 border-l-4 border-l-[#F5365C]'
              : 'border-green-200 border-l-4 border-l-blue-500'
          }`}>
          <p
            role={isError ? 'alert' : 'status'}
            className={`pt-0.5 text-xs font-medium leading-[1.4] ${
              isError ? 'text-[#981733]' : 'text-blue-700'
            }`}>
            {notification.message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NotificationToast;
