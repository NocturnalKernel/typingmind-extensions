/**
 * TypingMind Jump Navigation Extension
 * @version 1.5.0
 * @description Jump between messages (All or User-Only) using keyboard shortcuts
 * @author NocturnalKernel
 * @license MIT
 * 
 * ============================================
 * KEYBOARD SHORTCUTS
 * ============================================
 *
 * --- MODE 1: JUMP ALL MESSAGES (User & AI) ---
 * Windows/Linux: Ctrl + Up/Down Arrow
 * Mac: Cmd + Up/Down Arrow
 *
 * --- MODE 2: JUMP USER PROMPTS ONLY ---
 * Windows/Linux: Ctrl + Shift + Up/Down Arrow
 * Mac: Cmd + Shift + Up/Down Arrow
 *
 * ============================================
 */

(function() {
    'use strict';

    // Prevent double-initialization if script loads multiple times
    if (window.__typingMindJumpNavLoaded) {
        console.log('[TypingMind Jump] Already loaded, skipping duplicate initialization.');
        return;
    }
    window.__typingMindJumpNavLoaded = true;

    // Selectors for different message types
    const ALL_MESSAGES_SELECTOR = '[data-element-id="user-message"], [data-element-id="ai-response"]';
    const USER_PROMPTS_SELECTOR = '[data-element-id="user-message"]';

    // Track current position
    let currentIndex = -1;

    /**
     * Find all message elements on the page based on the mode
     * @param {string} modeSelector - CSS selector for the message type
     * @returns {Element[]} Array of message elements
     */
    function getMessages(modeSelector) {
        return Array.from(document.querySelectorAll(modeSelector));
    }

    /**
     * Find which message is closest to the top of the viewport
     * @param {Element[]} messages - Array of message elements
     * @returns {number} Index of the visible message
     */
    function findVisibleMessageIndex(messages) {
        const headerOffset = 80;

        for (let i = 0; i < messages.length; i++) {
            const rect = messages[i].getBoundingClientRect();
            if (rect.bottom > headerOffset) {
                return i;
            }
        }
        return 0;
    }

    /**
     * Handle keydown events for navigation
     * @param {KeyboardEvent} e - The keyboard event
     * @returns {boolean|undefined}
     */
    function handleKeydown(e) {
        // --- Check for Mode 1: Ctrl + Arrow (All Messages) ---
        const isMode1 = (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown');

        // --- Check for Mode 2: Ctrl + Shift + Arrow (User Prompts Only) ---
        const isMode2 = (e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown');

        if (!isMode1 && !isMode2) return;

        // STOP EVERYTHING - prevent TypingMind from seeing this event
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        let targetSelector;
        let modeName;

        if (isMode1) {
            targetSelector = ALL_MESSAGES_SELECTOR;
            modeName = "All Messages";
        } else if (isMode2) {
            targetSelector = USER_PROMPTS_SELECTOR;
            modeName = "User Prompts Only";
        } else {
            return;
        }

        // Get messages based on the detected mode
        const messages = getMessages(targetSelector);
        if (messages.length === 0) {
            console.log(`[TypingMind Jump] No messages found for mode: ${modeName}.`);
            return false;
        }

        // Sync currentIndex with what's actually visible
        currentIndex = findVisibleMessageIndex(messages);

        // Calculate target index
        let targetIndex;

        if (e.key === 'ArrowDown') {
            targetIndex = currentIndex + 1;
            if (targetIndex >= messages.length) {
                targetIndex = messages.length - 1;
                console.log(`[TypingMind Jump] Already at last message in ${modeName}.`);
            }
        } else {
            targetIndex = currentIndex - 1;
            if (targetIndex < 0) {
                targetIndex = 0;
                console.log(`[TypingMind Jump] Already at first message in ${modeName}.`);
            }
        }

        // Scroll to target
        if (targetIndex !== currentIndex || targetIndex === 0 || targetIndex === messages.length - 1) {
            messages[targetIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            currentIndex = targetIndex;
            console.log(`[TypingMind Jump] Jumped to message ${targetIndex + 1} of ${messages.length} (${modeName})`);
        }

        return false;
    }

    /**
     * Attach event listeners using capture phase
     */
    function attachListeners() {
        const options = { capture: true, passive: false };

        window.addEventListener('keydown', handleKeydown, options);
        document.addEventListener('keydown', handleKeydown, options);
        if (document.documentElement) {
            document.documentElement.addEventListener('keydown', handleKeydown, options);
        }
        if (document.body) {
            document.body.addEventListener('keydown', handleKeydown, options);
        }
    }

    // Initialize
    attachListeners();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachListeners);
    }
    
    window.addEventListener('load', attachListeners);

    console.log('[TypingMind Jump] Extension loaded. Use Ctrl+Up/Down (All) or Ctrl+Shift+Up/Down (User Only).');
})();
