import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true, maxlength: 2000 },
    type: { type: String, enum: ["text", "system"], default: "text" },
  },
  { timestamps: true },
);

// Compound index for fast history queries
messageSchema.index({ roomId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);
