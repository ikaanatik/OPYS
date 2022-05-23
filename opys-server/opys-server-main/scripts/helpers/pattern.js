import Filter from 'bad-words'

const filter = new Filter();
const mentionsAndTags = (text) => {
    const tagsPattern = /\B@[a-zA-Z0-9ğüşöçıİĞÜŞÖÇ]+/gi
    const mentionsPattern = /\B#[a-zA-Z0-9ğüşöçıİĞÜŞÖÇ]+/gi
    const tags = text.match(tagsPattern);
    const mentions = text.match(mentionsPattern);
    return { tags, mentions };
}
const filterText = (text) => {
    return filter.clean(text)
}
const calculateToAge = (date) => {
    return new Date().getFullYear() - new Date(date).getFullYear()

}
const emailLengthCheck = (email) => {
    return email.split("@")[0]?.length < 6 || email.split("@")[0]?.length > 30
}
export { mentionsAndTags, filterText, calculateToAge, emailLengthCheck }