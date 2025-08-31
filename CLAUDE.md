# Instructions

## Software Rules
1. Never use ParseInt, always use Number. The Radix is too easy to forget and cause errors in code.
2. Always put Web Components inside `js/components/**/*.js` directory and use PascalCase for the file names.
3. YOU MUST use idb-keyval for all LocalStorage



## AnimeJS Rules
You MUST follow these rules for ANY useage of AnimeJS

# AnimeJS 4.0 Complete Usage Guide - Based on Pokemon Jukebox Implementation

## Installation & Setup

### 1. Import AnimeJS 4.0 (ES6 Modules)
```javascript
// Import named exports - V4 uses named exports, NOT default export
import { animate, stagger } from '../node_modules/animejs/lib/anime.esm.js';

// Available named exports:
// animate, stagger, Timeline, Draggable, ScrollObserver,
// utils, engine, eases, svg, text, waapi
```

## Core Animation Functions

### 1. Basic Animation with `animate()`
```javascript
// Simple animation with duration and easing
animate(element, {
  translateX: 2,
  duration: 50,
  easing: 'easeOutQuad'
});

// Animation with opacity and translation
animate('.piano-key', {
  opacity: [0, 1],           // From 0 to 1
  translateX: [-20, 0],       // From -20px to 0
  duration: 500,
  easing: 'easeOutQuad'
});
```

### 2. Staggered Animations
```javascript
// Stagger multiple elements with delay
animate('.piano-key', {
  opacity: [0, 1],
  translateX: [-20, 0],
  delay: stagger(10, { from: 'first' }),  // 10ms delay between each element
  duration: 500,
  easing: 'easeOutQuad'
});

// Stagger options:
// - from: 'first' | 'last' | 'center' | index
// - direction: 'normal' | 'reverse'
// - grid: [rows, cols] for grid layouts
```

### 3. Property Animation Syntax
```javascript
// Animate from current value to target
animate(element, {
  translateX: 100,          // Move to 100px
  rotate: 45,              // Rotate 45 degrees
  scale: 1.5,              // Scale to 1.5x
  duration: 300
});

// Animate with from-to values
animate(element, {
  translateX: [0, 100],     // From 0 to 100px
  opacity: [0, 1],          // From 0 to 1
  scale: [0.5, 1],          // From 0.5x to 1x
  duration: 500
});
```

## Animation Parameters

### Duration & Timing
```javascript
animate(element, {
  translateX: 100,
  duration: 500,            // Duration in milliseconds
  delay: 100,              // Delay before start
  endDelay: 50,            // Delay after completion
  easing: 'easeOutQuad'    // Easing function
});
```

### Available Easing Functions
```javascript
// Linear
'linear'

// Ease variations
'easeInQuad', 'easeOutQuad', 'easeInOutQuad'
'easeInCubic', 'easeOutCubic', 'easeInOutCubic'
'easeInQuart', 'easeOutQuart', 'easeInOutQuart'
'easeInQuint', 'easeOutQuint', 'easeInOutQuint'
'easeInSine', 'easeOutSine', 'easeInOutSine'
'easeInExpo', 'easeOutExpo', 'easeInOutExpo'
'easeInCirc', 'easeOutCirc', 'easeInOutCirc'
'easeInBack', 'easeOutBack', 'easeInOutBack'
'easeInElastic', 'easeOutElastic', 'easeInOutElastic'
'easeInBounce', 'easeOutBounce', 'easeInOutBounce'

// Custom cubic-bezier
'cubicBezier(0.550, 0.055, 0.675, 0.190)'
```

## Transform Properties

### Translation
```javascript
animate(element, {
  translateX: 100,          // Move horizontally
  translateY: 50,           // Move vertically
  translateZ: 0,            // Move in 3D space
  duration: 500
});
```

### Rotation
```javascript
animate(element, {
  rotate: 360,              // Rotate in degrees
  rotateX: 180,             // Rotate around X axis
  rotateY: 90,              // Rotate around Y axis
  rotateZ: 45,              // Rotate around Z axis
  duration: 1000
});
```

### Scale
```javascript
animate(element, {
  scale: 2,                 // Uniform scale
  scaleX: 1.5,              // Scale horizontally
  scaleY: 2,                // Scale vertically
  scaleZ: 1,                // Scale in 3D
  duration: 500
});
```

### Skew
```javascript
animate(element, {
  skewX: 30,                // Skew horizontally
  skewY: 15,                // Skew vertically
  duration: 500
});
```

## CSS Properties

### Opacity & Colors
```javascript
animate(element, {
  opacity: [0, 1],
  backgroundColor: ['#FF0000', '#00FF00'],
  color: ['#000', '#FFF'],
  borderColor: '#0000FF',
  duration: 1000
});
```

### Dimensions
```javascript
animate(element, {
  width: '100px',
  height: [50, 200],        // From 50px to 200px
  padding: '20px',
  margin: '10px',
  duration: 500
});
```

### Borders & Shadows
```javascript
animate(element, {
  borderRadius: '50%',
  borderWidth: [1, 5],
  boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
  duration: 500
});
```

## Animation Control

### Animation Instance Methods
```javascript
// Create animation instance
const animation = animate(element, {
  translateX: 100,
  duration: 1000
});

// Control methods
animation.play();           // Play animation
animation.pause();          // Pause animation
animation.restart();        // Restart from beginning
animation.reverse();        // Reverse direction
animation.seek(500);        // Jump to specific time (ms)
animation.finished.then(() => {
  console.log('Animation completed');
});
```

## Callbacks & Events

### Animation Callbacks
```javascript
animate(element, {
  translateX: 100,
  duration: 1000,

  // Callback functions
  begin: function(anim) {
    console.log('Animation started');
  },
  complete: function(anim) {
    console.log('Animation completed');
  },
  update: function(anim) {
    console.log('Progress:', anim.progress);
  },
  change: function(anim) {
    console.log('Value changed');
  }
});
```

## Advanced Stagger Patterns

### Stagger with Custom Options
```javascript
// Basic stagger with delay
animate('.item', {
  translateY: [50, 0],
  opacity: [0, 1],
  delay: stagger(100),      // 100ms between each
  duration: 500
});

// Stagger from center
animate('.item', {
  scale: [0, 1],
  delay: stagger(50, { from: 'center' }),
  duration: 300
});

// Stagger with direction
animate('.item', {
  translateX: [-100, 0],
  delay: stagger(30, {
    from: 'last',
    direction: 'reverse'
  }),
  duration: 500
});

// Grid stagger
animate('.grid-item', {
  scale: [0, 1],
  delay: stagger(100, {
    grid: [5, 5],           // 5x5 grid
    from: 'center'
  }),
  duration: 400
});
```

## Keyframe Animations

### Multiple Keyframes
```javascript
animate(element, {
  translateX: [
    { value: 0, duration: 100 },
    { value: 100, duration: 200 },
    { value: 50, duration: 150 },
    { value: 200, duration: 300 }
  ],
  easing: 'easeOutQuad'
});

// With different easings per keyframe
animate(element, {
  translateY: [
    { value: 0, easing: 'easeOutQuad' },
    { value: -50, easing: 'easeInQuad' },
    { value: 0, easing: 'easeOutBounce' }
  ],
  duration: 1000
});
```

## Performance Tips

### 1. Use Transform Properties When Possible
```javascript
// GOOD - Uses GPU acceleration
animate(element, {
  translateX: 100,
  scale: 1.5,
  rotate: 45
});

// AVOID - Causes reflow/repaint
animate(element, {
  left: '100px',
  width: '200px',
  height: '150px'
});
```

### 2. Batch Animations
```javascript
// GOOD - Single animation call
animate('.items', {
  translateY: [20, 0],
  opacity: [0, 1],
  delay: stagger(50),
  duration: 500
});

// AVOID - Multiple animation calls
document.querySelectorAll('.items').forEach((item, i) => {
  animate(item, {
    translateY: [20, 0],
    opacity: [0, 1],
    delay: i * 50,
    duration: 500
  });
});
```

### 3. Use will-change CSS Property
```css
.animated-element {
  will-change: transform, opacity;
}
```

## Common Animation Patterns

### Fade In
```javascript
animate(element, {
  opacity: [0, 1],
  duration: 500,
  easing: 'easeOutQuad'
});
```

### Slide In from Left
```javascript
animate(element, {
  translateX: [-100, 0],
  opacity: [0, 1],
  duration: 600,
  easing: 'easeOutCubic'
});
```

### Scale Bounce
```javascript
animate(element, {
  scale: [0, 1.1, 1],
  duration: 800,
  easing: 'easeOutElastic'
});
```

### Rotate and Fade
```javascript
animate(element, {
  rotate: [0, 360],
  opacity: [0, 1],
  duration: 1000,
  easing: 'easeInOutQuad'
});
```

### Pulse Effect
```javascript
animate(element, {
  scale: [1, 1.05, 1],
  duration: 1000,
  loop: true,
  easing: 'easeInOutQuad'
});
```

## View Transitions API Integration

### Combining with View Transitions
```javascript
// Trigger view transition
if (document.startViewTransition) {
  document.startViewTransition(() => {
    // DOM changes here
    element.classList.add('new-state');

    // Enhance with AnimeJS
    animate(element, {
      scale: [0.8, 1],
      opacity: [0, 1],
      duration: 300
    });
  });
}
```

## Project-Specific Patterns (from Pokemon Jukebox)

### Piano Key Press Animation
```javascript
// Key press effect
function animateKeyPress(keyElement) {
  animate(keyElement, {
    translateX: 2,
    duration: 50,
    easing: 'easeOutQuad'
  });
}

// Key release effect
function animateKeyRelease(keyElement) {
  animate(keyElement, {
    translateX: 0,
    duration: 100,
    easing: 'easeOutQuad'
  });
}
```

### Initial Load Animation
```javascript
// Staggered reveal of piano keys
animate('.piano-key', {
  opacity: [0, 1],
  translateX: [-20, 0],
  delay: stagger(10, { from: 'first' }),
  duration: 500,
  easing: 'easeOutQuad'
});
```

## Important Notes

1. **Always use named imports** - V4 doesn't have a default export
2. **First parameter is the target** - Not part of the options object
3. **Properties go in the second parameter** - As an options object
4. **Use array notation for from-to values** - [from, to]
5. **Stagger is a function** - Pass it to delay property
6. **Callbacks are part of options** - begin, complete, update, change
7. **Animation returns a promise** - Use .finished for async operations
8. **Transform properties are preferred** - Better performance than position properties
9. **Batch animations when possible** - Better performance
10. **ES6 modules only** - No CommonJS support in browser
