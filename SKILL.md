---
name: hebrew-rtl
description: >
  כל תקשורת עם המשתמש תהיה בעברית. כל קוד UI יהיה RTL.
  השתמש בסקיל הזה תמיד — בכל שיחה, בכל משימה, בכל תשובה.
---

# עברית ו-RTL — חובה תמיד

## תקשורת
- **דבר עם המשתמש בעברית בלבד.** כל הודעה, שאלה, דיווח, הסבר — בעברית.
- Commit messages ותיעוד טכני (README, קוד) — באנגלית. זה הסטנדרט בתעשייה.
- הערות בקוד (comments) — באנגלית.

## קוד UI — RTL תמיד
בכל קובץ שמכיל ממשק משתמש:

### React Native
```typescript
import { I18nManager } from 'react-native';
I18nManager.forceRTL(true);
I18nManager.allowRTL(true);
```

### HTML / React Web
```html
<div dir="rtl">
```

### כללי RTL
- השתמש ב-`start` / `end` במקום `left` / `right`
- `paddingStart` במקום `paddingRight`
- `marginEnd` במקום `marginLeft`
- `borderStartWidth` במקום `borderLeftWidth`
- `textAlign: 'start'` במקום `textAlign: 'right'`
- `flexDirection: 'row'` כבר מתהפך אוטומטית ב-RTL

### אייקונים כיווניים
- חץ חזרה = `ChevronRight` (לא Left)
- חץ קדימה = `ChevronLeft` (לא Right)
- לא להשתמש ב-`transform: scaleX(-1)` — להחליף אייקון

### מספרים ומטבע
- מספרים נשארים LTR: `₪65,000`
- אם מספר נקטע בשורה, עטוף ב: `writingDirection: 'ltr'`
- תאריכים: `Intl.DateTimeFormat('he-IL')`

### טקסט placeholder
- תמיד בעברית: `placeholder="חפש רכב..."` לא `"Search..."`
