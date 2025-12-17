// パスワードの最小文字数
export const MIN_PASSWORD_LENGTH = 10;

// よく使われる弱いパスワードのリスト
const WEAK_PASSWORDS = [
  "password",
  "password1",
  "password123",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty",
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
  "abc12345",
  "abcd1234",
  "letmein",
  "welcome",
  "monkey",
  "dragon",
  "master",
  "baseball",
  "iloveyou",
  "trustno1",
  "sunshine",
  "princess",
  "admin",
  "administrator",
  "passw0rd",
  "p@ssword",
  "p@ssw0rd",
];

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
  score: number; // 0-100
}

/**
 * パスワードの強度を計算
 */
export function calculatePasswordStrength(password: string): {
  strength: "weak" | "medium" | "strong";
  score: number;
} {
  let score = 0;

  // 文字数によるスコア（最大50点）
  if (password.length >= 10) score += 20;
  if (password.length >= 12) score += 15;
  if (password.length >= 15) score += 15;

  // 文字種によるスコア（最大50点）
  if (/[a-z]/.test(password)) score += 10; // 小文字
  if (/[A-Z]/.test(password)) score += 10; // 大文字
  if (/[0-9]/.test(password)) score += 15; // 数字
  if (/[^a-zA-Z0-9]/.test(password)) score += 15; // 特殊文字

  // 強度の判定
  let strength: "weak" | "medium" | "strong";
  if (score >= 70) {
    strength = "strong";
  } else if (score >= 40) {
    strength = "medium";
  } else {
    strength = "weak";
  }

  return { strength, score: Math.min(score, 100) };
}

/**
 * パスワードのバリデーション
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // 文字数チェック
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`パスワードは${MIN_PASSWORD_LENGTH}文字以上で入力してください`);
  }

  // 弱いパスワードチェック
  const lowerPassword = password.toLowerCase();
  if (WEAK_PASSWORDS.includes(lowerPassword)) {
    errors.push("このパスワードは推測されやすいため使用できません");
  }

  // 連続する同じ文字のチェック（例: aaaaaa）
  if (/(.)\1{4,}/.test(password)) {
    errors.push("同じ文字が5回以上連続しています");
  }

  // 連続する数字のチェック（例: 123456）
  if (/(?:012|123|234|345|456|567|678|789|890){2,}/.test(password)) {
    errors.push("連続する数字の並びは避けてください");
  }

  const { strength, score } = calculatePasswordStrength(password);

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score,
  };
}
