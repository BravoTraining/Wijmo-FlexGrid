export enum BravoLangEnum {
    /// <summary>
    /// Vietnamese (Vietnam) vi-VN
    /// </summary>
    Vietnamese = 1066, // 0x042A

    /// <summary>
    /// English (United States) en-US
    /// </summary>
    English = 1033, // 0x0409

    /// <summary>
    /// Japanese (Japan) ja-JP
    /// </summary>
    Japanese = 1041, // 0x0411

    /// <summary>
    /// Chinese (China) zh-CN
    /// </summary>
    Chinese = 2052, // 0x0804

    /// <summary>
    /// Korean (Korea) ko-KR
    /// </summary>
    Korean = 1042, // 0x0412

    /// <summary>
    /// Reserved custom language
    /// </summary>
    Custom = 0x007F
}

export enum AggregateEnum {
    None = 0,
    Clear = 1,
    Sum = 2,
    Percent = 3,
    Count = 4,
    Average = 5,
    Max = 6,
    Min = 7,
    Std = 8,
    Var = 9,
    StdPop = 10,
    VarPop = 11
}

export enum SortOrder {
    //
    // Summary:
    //     The items are not sorted.
    None = 0,
    //
    // Summary:
    //     The items are sorted in ascending order.
    Ascending = 1,
    //
    // Summary:
    //     The items are sorted in descending order.
    Descending = 2
}

export enum DatePartEnum {
    year, yy, yyyy,
    quarter, qq, q,
    month, mm, m,
    dayofyear, dy, y,
    day, dd, d,
    week, wk, ww,
    weekday, dw,
    hour, hh,
    minute, mi, n,
    second, ss, s,
    millisecond, ms,
    microsecond, mcs,
    //nanosecond, ns,
    //TZoffset, tz,
    //ISO_WEEK, isowk, isoww
}

export enum OperatorEnum {
    Unknown, // This for internal process
    Declare, // This for internal process
    Set, // This for internal process
    Value, // This for internal process

    // Binary
    Addition, // + 
    Subtraction, // - 
    Multiplication, // *
    Division, // /
    Modulus, // %

    Eval,

    Arguments, //,
    Parent, // Parent
    Child, // Child
    MemberAccess, // .

    GreaterThan,  // >
    LessThan,  // <
    Equal, // =
    Notequal, // <>
    Equality, // ==
    Inequality, // !=
    GreaterThanOrEqual,  // >=
    LessThanOrEqual, // <=
    And,
    Or,

    Like,
    In,
    Between,
    Is,

    // Unary
    UnaryPlus, // +
    UnaryNegation, // -
    LogicalNot, // !
    Not,
    Iif,
    Case,
    IsNull,
    Coalesce,
    Convert,
    Empty,
    IsInteger,
    IsNumeric,
    IsDatetime,

    // Math
    Sqr,
    Abs,
    Sin,
    Cosin,
    Round,
    RoundUp,
    RoundDown,
    Ceiling,
    Floor,
    Pow,
    MaxOf,
    MinOf,

    // Aggregate
    Max,
    Min,
    Sum,
    SumIf,
    Avg,
    Concat,
    Count,
    CountIf,
    Mode,

    Vlookup,
    Hlookup,
    Exists,

    // String
    Left,
    Right,
    PadL,
    PadLeft,
    PadR,
    PadRight,
    SubStr,
    SubString,
    CharIndex,
    Replace,
    Stuff,
    Len,
    Trim,
    Ltrim,
    Rtrim,
    Str,
    Upper,
    Lower,
    RemoveAccent,
    SpellNumber,

    RegexMatch,
    RegexReplace,
    RegexExtract,

    // Datetime
    DateAdd,
    DateDiff,
    DatePart,
    Hour,
    Minute,
    Second,
    Day,
    Month,
    Year,
    Quarter,
    GetDate,
    GetUtcDate,
    GetDatetime,
    GetUtcDatetime,
    Date,
    StartDateOfYear,
    SOYear,
    EndDateOfYear,
    EOYear,
    StartDateOfMonth,
    SOMonth,
    EndDateOfMonth,
    EOMonth,
    StartDateOfQuarter,
    SOQuarter,
    EndDateOfQuarter,
    EOQuarter,
    IsFiscalDate,
    IsSpecialDate,

    // Display formatting
    Format,
    FormatCurrency,
    FormatQuantity,
    FormatDateRange,

    // Current UI language
    LangId,
    LangName,

    // Return a name by current UI language
    NameByLang,

    // Global system variables
    System,

    // Config variables
    Config,

    // Currency info
    Currency,

    // Current user info
    User,

    // Current branch info
    Branch,

    // Return filter expression of branch code
    BranchFilter,

    // Current fiscal year info
    FiscalYear,

    // Signature text
    SignatureText,

    // Signature image
    SignatureImage,

    /// <summary>
    /// Return value of column at current row of binding source
    /// </summary>
    CurrentValue,

    /// <summary>
    /// Return state of row
    /// </summary>
    RowState,

    /// <summary>
    /// Return True if row has error
    /// </summary>
    //RowError,

    /// <summary>
    /// Return True if an indicated column has error
    /// </summary>
    //ColumnError,

    /// <summary>
    /// Current changing data column
    /// </summary>
    UpdatedColumn,

    /// <summary>
    /// Display text
    /// </summary>
    Text,

    /// <summary>
    /// Current selected grid column
    /// </summary>
    ColumnName,

    /// <summary>
    /// Current selected grid table (or view)
    /// </summary>
    TableName,

    /// <summary>
    /// Last application command has been executed
    /// </summary>
    LastCommand,

    OsMachineName,

    OsDomainName,

    OsUserName,

    ServerName,

    DatabaseName,

    FormCommandName,

    LayoutName,

    LayoutId,

    VerifyChecksum,

    TokenRawData,

    TokenSignData,

    Encrypt,

    Decrypt,

    HashValue,
}

export enum OperatorTypeEnum {
    /// The operation with only one operand
    Unary,

    /// The operation with two operands
    Binary
}

export enum OperatorLevelEnum {
    Operator,
    Function
}

export enum MouseButtons {
    Left = 0,
    Middle = 1,
    Right = 2
}

export enum BravoFontSizeEnum {
    textSize1 = 1,
    textSize2 = 2,
    textSize3 = 3,
    textSize4 = 4,
    textSize5 = 5
}

export enum DisplayStyleEnum {
    None,
    Text,
    Image,
    ImageAndText
}

export enum AlignmentEnum {
    Left,
    Right
}