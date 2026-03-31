export default (totalPages) => Array.from({ length: totalPages }, (_, index) => `${index + 1}`);
