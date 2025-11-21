import User from "./User.js";
import Job from "./Job.js";
import Application from "./Application.js";
import Idea from "./Idea.js";
import Comment from "./Comment.js";
import IdeaLike from "./IdeaLike.js";
import ChatRoom from "./ChatRoom.js";
import Message from "./Message.js";
import MessageRead from "./MessageRead.js";
import ChatRoomParticipant from "./ChatRoomParticipant.js";
import Token from "./Token.js";
import RefreshToken from "./RefreshToken.js";

// User associations
User.hasMany(Job, { foreignKey: "postedById", as: "postedJobs" });
User.hasMany(Idea, { foreignKey: "createdById", as: "createdIdeas" });
User.hasMany(Application, { foreignKey: "applicantId", as: "applications" });
User.hasMany(Comment, { foreignKey: "userId", as: "comments" });
User.hasMany(IdeaLike, { foreignKey: "userId", as: "likedIdeas" });
User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
User.hasMany(MessageRead, { foreignKey: "userId", as: "readMessages" });
User.hasMany(ChatRoomParticipant, { foreignKey: "userId", as: "chatRooms" });
User.hasMany(Token, { foreignKey: "userId", as: "tokens" });
User.hasMany(RefreshToken, { foreignKey: "userId", as: "refreshTokens" });

// Job associations
Job.belongsTo(User, { foreignKey: "postedById", as: "postedBy" });
Job.hasMany(Application, { foreignKey: "jobId", as: "applications" });
Job.hasOne(ChatRoom, { foreignKey: "jobId", as: "chatRoom" });

// Application associations
Application.belongsTo(User, { foreignKey: "applicantId", as: "applicant" });
Application.belongsTo(Job, { foreignKey: "jobId", as: "job" });

// Idea associations
Idea.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });
Idea.hasMany(Comment, { foreignKey: "ideaId", as: "comments" });
Idea.hasMany(IdeaLike, { foreignKey: "ideaId", as: "likes" });
Idea.hasOne(ChatRoom, { foreignKey: "ideaId", as: "chatRoom" });

// Comment associations
Comment.belongsTo(Idea, { foreignKey: "ideaId", as: "idea" });
Comment.belongsTo(User, { foreignKey: "userId", as: "user" });

// IdeaLike associations
IdeaLike.belongsTo(Idea, { foreignKey: "ideaId", as: "idea" });
IdeaLike.belongsTo(User, { foreignKey: "userId", as: "user" });

// ChatRoom associations
ChatRoom.belongsTo(Idea, { foreignKey: "ideaId", as: "idea" });
ChatRoom.belongsTo(Job, { foreignKey: "jobId", as: "job" });
ChatRoom.hasMany(Message, { foreignKey: "chatRoomId", as: "messages" });
ChatRoom.hasMany(ChatRoomParticipant, { foreignKey: "chatRoomId", as: "participants" });

// Message associations
Message.belongsTo(ChatRoom, { foreignKey: "chatRoomId", as: "chatRoom" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Message.hasMany(MessageRead, { foreignKey: "messageId", as: "readBy" });

// MessageRead associations
MessageRead.belongsTo(Message, { foreignKey: "messageId", as: "message" });
MessageRead.belongsTo(User, { foreignKey: "userId", as: "user" });

// ChatRoomParticipant associations
ChatRoomParticipant.belongsTo(ChatRoom, { foreignKey: "chatRoomId", as: "chatRoom" });
ChatRoomParticipant.belongsTo(User, { foreignKey: "userId", as: "user" });

// Token associations
Token.belongsTo(User, { foreignKey: "userId", as: "user" });

// RefreshToken associations
RefreshToken.belongsTo(User, { foreignKey: "userId", as: "user" });

export {
  User,
  Job,
  Application,
  Idea,
  Comment,
  IdeaLike,
  ChatRoom,
  Message,
  MessageRead,
  ChatRoomParticipant,
  Token,
  RefreshToken,
};

