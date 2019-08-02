export enum Rule {
    None,
    Cascade,
    SetNull,
    SetDefault
}

export enum TypeCode {
    Empty = 0,
    Object = 1,
    DBNull = 2,
    Boolean = 3,
    Char = 4,
    SByte = 5,
    Byte = 6,
    Int16 = 7,
    UInt16 = 8,
    Int32 = 9,
    UInt32 = 10,
    Int64 = 11,
    UInt64 = 12,
    Single = 13,
    Double = 14,
    Decimal = 15,
    DateTime = 16,
    String = 18,
    ByteArray = 19
}

export enum DataRowState {
    Detached = 1,
    Unchanged = 2,
    Added = 4,
    Deleted = 8,
    Modified = 16
}

export enum DataRowAction {
    Nothing = 0,
    Delete = 1,
    Change = 2,
    Rollback = 4,
    Commit = 8,
    Add = 16,
    ChangeOriginal = 32,
    ChangeCurrentAndOriginal = 64
}