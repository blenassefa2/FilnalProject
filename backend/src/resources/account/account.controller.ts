import { Account, IAccountInterface } from "./account.model";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import { transporter } from "../../middleware/sendEmail";
import XLSX from "xlsx";
import * as randomstring from "randomstring";
import cloudinary from "../../config/cloudinary";

// Usage


export const registerMany = async(req:Request, res: Response, next: NextFunction) => {
try {
  const filePath = req.file.path;

  // Read the uploaded file
  const workbook = XLSX.readFile(filePath);

  // Get the sheet you want to extract the employee data from (assuming it's the first sheet in this example)
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  // Convert the sheet data to a JSON object
  const employees = XLSX.utils.sheet_to_json(worksheet);

  // Process the employee data and save to the database
  for (const employeeData of employees) {
    const randomPassword: string = randomstring.generate(10); // Generate a 10-character random password
    // Generate a hash of the password
   

   // Generate a hash of the password
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const employee = employeeData as IAccountInterface;
    const newEmployee = new Account({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      password: hashedPassword,
      role: employee.role,
      woreda: employee.woreda,
      maritaStatus: employee.maritaStatus,
      town: employee.town,
      houeseNo: employee.houeseNo,
      kebele: employee.kebele,
    });

    await newEmployee.save();
    // console.log("Created employee:", newEmployee);
    const mailOptions = {
      from: "aauhumanresource@gmail.com",
      to: employee.email as string,
      subject: "New account",
      text: "password: " + randomPassword,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!", info.response);
  }

  res.locals.json = {
    statusCode: 200,
    message: "File uploaded and employees created successfully.",
  };
  return next();

} catch(err) {
  console.log(err)
  res.locals.json = {
    statusCode: 500,
    error: "An error occurred while processing the file.",
  };
  return next();
}
}
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
   const cloudinaryImage = await cloudinary.uploader.upload(req.file.path, {
      folder: "photo",
      use_filename: true,
    });
const hashedpass = await bcrypt.hash(req.body.password, 10);

    let user = await new Account({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role,
      password: hashedpass,
      photo: cloudinaryImage.secure_url,
      woreda: req.body.woreda,
      maritaStatus: req.body.maritaStatus,
      town: req.body.town,
      houeseNo: req.body.houeseNo,
      kebele: req.body.kebele,
    });
    await user.save()
      
        res.locals.json = {
          statusCode: 200,
          data: user,
        };
        return next();
      } catch(error)
      {
        console.log(error);
        res.locals.json = {
          statusCode: 500,
          message: "error occured",
        };
        return next();
      }
 
    }
export const getAccountById = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = res.locals._id;

  Account.findById({ _id: userId })
    .then((user) => {
      if (user) {
        res.locals.json = {
          statusCode: 200,
          data: user,
        };
        return next();
      } else {
        res.locals.json = {
          statusCode: 404,
          message: "user not found",
        };
        return next();
      }
    })
    .catch((error) => {
      res.locals.json = {
        statusCode: 500,
        message: "error occured",
      };
      return next();
    });
};
export const updateAccountById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { firstName, lastName, email, phoneNumber } = req.body;
  const userId = req.params.id;
  await Account.findByIdAndUpdate(
    { _id: userId },
    { firstName, lastName, email, phoneNumber }
  )
    .then((user) => {
      if (user) {
        res.locals.json = {
          statusCode: 200,
          data: user,
        };
        return next();
      } else {
        res.locals.json = {
          statusCode: 404,
          message: "user not found",
        };
        return next();
      }
    })
    .catch((error) => {
      res.locals.json = {
        statusCode: 500,
        message: "error occured",
      };
      return next();
    });
};

export const deleteAccountById = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.id;

  Account.deleteOne({ _id: userId })
    .then((result) => {
      if (result.deletedCount && result.deletedCount === 1) {
        res.locals.json = {
          statusCode: 200,
          data: "User deleted successfully",
        };
        return next();
      } else {
        res.locals.json = {
          statusCode: 404,
          message: "user not found",
        };
        return next();
      }
    })
    .catch((error) => {
      res.locals.json = {
        statusCode: 500,
        message: "error occured",
      };
      return next();
    });
};
