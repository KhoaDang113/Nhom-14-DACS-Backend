const { userModel } = require("../models");
async function formatGig(gig) {
  const user = await userModel.findOne({ clerkId: gig.freelancerId });
  return {
    _id: gig._id,
    title: gig.title,
    price: parseFloat(gig.price),
    media: gig.media,
    duration: gig.duration,
    category_id: gig.category_id,
    createdAt: gig.createdAt,
    freelancer: gig.freelancerId,
    name: user?.name || null,
    email: user?.email || null,
  };
}

async function formatGigs(gigs) {
  return await Promise.all(gigs.map(formatGig));
}

module.exports = { formatGig, formatGigs };
