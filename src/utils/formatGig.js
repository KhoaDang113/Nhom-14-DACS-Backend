const { userModel, categoryModel } = require("../models");
async function formatGig(gig) {
  const user = await userModel.findOne({ clerkId: gig.freelancerId });
  return {
    _id: gig._id,
    title: gig.title,
    description: gig.description,
    price: parseFloat(gig.price),
    media: gig.media,
    duration: gig.duration,
    views: gig.views || 0,
    ordersCompleted: gig.ordersCompleted || 0,
    category_id: gig.category_id,
    createdAt: gig.createdAt,
    freelancer: {
      name: user?.name || null,
      avatar: user?.avatar || null,
    },
    user: user || null,
    isDeleted: gig.isDeleted,
    name: user?.name || null,
    avatar: user?.avatar || null,
    email: user?.email || null,
  };
}

async function formatGigs(gigs) {
  return await Promise.all(gigs.map(formatGig));
}

async function formatJobHot(gig) {
  const user = await userModel.findOne({ clerkId: gig.freelancerId });
  const category = await categoryModel.findById(gig.category_id);

  return {
    _id: gig._id,
    title: gig.title,
    description: gig.description,
    category: {
      _id: category._id || null,
      name: category.name || null,
    },
    price: parseFloat(gig.price),
    media: gig.media,
    views: gig.views || 0,
    ordersCompleted: gig.ordersCompleted || 0,
    isHot: gig.isHot,
    createdAt: gig.createdAt,
    freelancer: {
      name: user?.name || null,
      avatar: user?.avatar || null,
    },
  };
}

async function formatJobHots(gigs) {
  return await Promise.all(gigs.map(formatJobHot));
}
module.exports = { formatGig, formatGigs, formatJobHot, formatJobHots };
