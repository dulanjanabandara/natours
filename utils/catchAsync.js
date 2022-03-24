// eslint-disable-next-line arrow-body-style
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
    // Above is same as below
    // fn(req, res, next).catch((err) => next(err));
  };
};
