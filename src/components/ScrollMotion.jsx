import {
  Children,
  createElement,
  isValidElement,
  useRef,
  useState,
} from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

const ease = [0.22, 1, 0.36, 1];
const viewport = { once: true, amount: 0.12 };
const entrance = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

// Keep the existing element and box model; animate only opacity and transforms.
export function Reveal({ children, as = "div", delay = 0, ...props }) {
  const reduced = useReducedMotion();
  const [focused, setFocused] = useState(false);
  const Element = motion[as];
  return (
    <Element
      {...props}
      initial={reduced ? false : "hidden"}
      animate={reduced || focused ? "visible" : undefined}
      whileInView="visible"
      viewport={viewport}
      variants={entrance}
      transition={{
        duration: reduced ? 0 : 0.65,
        delay: reduced || focused ? 0 : delay,
        ease,
      }}
      onFocusCapture={() => setFocused(true)}
    >
      {children}
    </Element>
  );
}

// Stagger short text blocks, not entire grids: offscreen rows wait for their own viewport entry.
export function TextReveal({ children, as = "div", delay = 0, ...props }) {
  const reduced = useReducedMotion();
  const [focused, setFocused] = useState(false);
  const Element = motion[as];
  const instant = reduced || focused;
  return (
    <Element
      {...props}
      initial={reduced ? false : "hidden"}
      animate={instant ? "visible" : undefined}
      whileInView="visible"
      viewport={viewport}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: instant ? 0 : 0.075,
            delayChildren: instant ? 0 : delay,
          },
        },
      }}
      onFocusCapture={() => setFocused(true)}
    >
      {Children.map(children, (child) => {
        if (
          !isValidElement(child) ||
          typeof child.type !== "string" ||
          child.props["aria-hidden"]
        )
          return child;
        return createElement(motion[child.type], {
          ...child.props,
          variants: entrance,
          transition: { duration: instant ? 0 : 0.6, ease },
        });
      })}
    </Element>
  );
}

export function ImageReveal({
  delay = 0,
  hoverScale = 1.03,
  restingScale = 1,
  className = "",
  style,
  ...props
}) {
  const reduced = useReducedMotion();
  return (
    <motion.img
      {...props}
      className={`scroll-image ${className}`}
      style={style}
      initial={reduced ? false : { opacity: 0, scale: 1.045 }}
      animate={reduced ? { opacity: 1, scale: 1 } : undefined}
      whileInView={{ opacity: 1, scale: reduced ? 1 : restingScale }}
      whileHover={reduced ? undefined : { scale: hoverScale }}
      viewport={viewport}
      transition={{
        duration: reduced ? 0 : 0.85,
        delay: reduced ? 0 : delay,
        ease,
      }}
    />
  );
}

export function ParallaxImage(props) {
  const reduced = useReducedMotion();
  return reduced ? <ImageReveal {...props} /> : <MovingImage {...props} />;
}

function MovingImage(props) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Percentage-based travel stays tiny on phones; overscan avoids exposing image edges.
  const y = useTransform(scrollYProgress, [0, 1], ["-1%", "1%"]);
  return (
    <ImageReveal
      {...props}
      ref={ref}
      style={{ y }}
      restingScale={1.025}
      hoverScale={1.03}
    />
  );
}
