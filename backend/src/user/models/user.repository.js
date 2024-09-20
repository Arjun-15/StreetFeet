import UserModel from "./user.schema.js";

export const createNewUserRepo = async (user) => {
  return await new UserModel(user).save();
};

export const findUserRepo = async (factor, withPassword = false) => {
  if (withPassword) return await UserModel.findOne(factor).select("+password");
  else return await UserModel.findOne(factor);
};

export const findUserForPasswordResetRepo = async (hashtoken) => {
  console.log(hashtoken);
  const user = await UserModel.findOne({
    resetPasswordToken: hashtoken,  // Ensure hashtoken is a string
    resetPasswordExpire: { $gt: Date.now() },  // Check if the token is still valid
  });
  
  if (!user) {
    throw new Error('Reset token is invalid or has expired');
  }
  
  return user;
  // return await UserModel.findOne({
  //   resetPasswordToken: hashtoken,
  //   resetPasswordExpire: { $gt: Date.now() },
  // });
};

export const updateUserProfileRepo = async (_id, data) => {
  return await UserModel.findOneAndUpdate(_id, data, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
};

export const getAllUsersRepo = async () => {
  return UserModel.find({});
};

export const deleteUserRepo = async (_id) => {
  return await UserModel.findByIdAndDelete(_id);
};

export const updateUserRoleAndProfileRepo = async (_id, data) => {
  return await UserModel.findByIdAndUpdate(
    _id,
    {
      name: data.name,
      email: data.email,
      role: data.role, // This will allow role to be updated
    },
    {
      new: true, // Return the updated document
      runValidators: true, // Ensure the data adheres to schema validation
      useFindAndModify: false, // This avoids deprecation warning
    }
  );
};
