import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

export const registerRules = [
  body('username')
    .trim().isLength({ min: 3, max: 20 }).withMessage('Username must be 3–20 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, underscores'),
  body('email')
    .isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const loginRules = [
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const messageRules = [
  body('content').trim().isLength({ min: 1, max: 2000 })
    .withMessage('Message must be 1–2000 characters'),
];

export const roomRules = [
  body('name').trim().isLength({ min: 2, max: 50 })
    .withMessage('Room name must be 2–50 characters'),
  body('description').optional().isLength({ max: 200 })
    .withMessage('Description max 200 characters'),
];
