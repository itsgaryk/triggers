module.exports = (trigger) => {
    return triggers.some(i => i.text.toLowerCase() === trigger.toLowerCase());
}