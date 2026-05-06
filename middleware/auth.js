export function requireMarket(req, res, next) {
  if (!req.session.user || req.session.user.role !== "market") {
    return res.redirect("/login");
  }

  next();
}

export function requireConsumer(req, res, next) {
  if (!req.session.user || req.session.user.role !== "consumer") {
    return res.redirect("/login");
  }

  next();
}
