import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { getSurfaceMotion } from "../../utils/motionConfig";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const modalMotion = getSurfaceMotion("modal", shouldReduceMotion);

  return (
    <AnimatePresence>
      {open ? (
        <Dialog open={open} onClose={onClose} className="relative z-50">
          <motion.div
            className="fixed inset-0 bg-black/40 dark:bg-black/60"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={modalMotion.transition}
          />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              className="w-full max-w-md"
              initial={modalMotion.initial}
              animate={modalMotion.animate}
              exit={modalMotion.exit}
              transition={modalMotion.transition}
            >
              <DialogPanel className="w-full rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 dark:shadow-gray-900/50">
                <DialogTitle className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </DialogTitle>
                {children}
              </DialogPanel>
            </motion.div>
          </div>
        </Dialog>
      ) : null}
    </AnimatePresence>
  );
}
