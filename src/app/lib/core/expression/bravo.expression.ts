import { OperatorEnum, OperatorTypeEnum, OperatorLevelEnum } from "../enums";
import { MessageContstants } from "../common/message.constants";
import * as converter from '../bravo.datatype.converter';
import { Dictionary } from '../data/bravo.web.dictionary';
import { CryptoExtension } from '../crypto.extension';

// @dynamic

export class BravoExpression {
    //#region static members    

    public static readonly Empty = new BravoExpression();

    public static cachedExpressionCollection: Dictionary<string, Array<BravoExpression>> = new Dictionary();

    public static create(expression: string): BravoExpression[] {
        if (!expression)
            throw new Error(String.format(MessageContstants.ArgumentNullError, "expression"));

        let _zKey = CryptoExtension.sha256(expression);
        if (this.cachedExpressionCollection.containsKey(_zKey))
            return this.cachedExpressionCollection.getValue(_zKey);

        let _parse = new Parser();
        let _exprs = _parse.parseExpressions(expression);
        this.cachedExpressionCollection.add(_zKey, _exprs)

        return _exprs;
    }

    public static get Operators(): OperatorDescriptor[] {
        return [
            // Binary
            new OperatorDescriptor(OperatorEnum.Addition, "+", OperatorTypeEnum.Binary),
            new OperatorDescriptor(OperatorEnum.Subtraction, "-", OperatorTypeEnum.Binary),
            new OperatorDescriptor(OperatorEnum.Multiplication, "*", OperatorTypeEnum.Binary),
            new OperatorDescriptor(OperatorEnum.Division, "/", OperatorTypeEnum.Binary),
            new OperatorDescriptor(OperatorEnum.Modulus, "%", OperatorTypeEnum.Binary),

            new OperatorDescriptor(OperatorEnum.Arguments, ",", OperatorTypeEnum.Binary),
            new OperatorDescriptor(OperatorEnum.MemberAccess, ".", OperatorTypeEnum.Binary),

            new OperatorDescriptor(OperatorEnum.GreaterThan, ">", OperatorTypeEnum.Binary),
            new OperatorDescriptor(OperatorEnum.LessThan, "<", OperatorTypeEnum.Binary),
            new OperatorDescriptor(OperatorEnum.Equal, "=", OperatorTypeEnum.Binary),
            new OperatorDescriptor(OperatorEnum.Notequal, "<>", OperatorTypeEnum.Binary),
            new OperatorDescriptor(OperatorEnum.Equality, "==", OperatorTypeEnum.Binary),
            new OperatorDescriptor(OperatorEnum.Inequality, "!=", OperatorTypeEnum.Binary),
            new OperatorDescriptor(OperatorEnum.GreaterThanOrEqual, ">=", OperatorTypeEnum.Binary),
            new OperatorDescriptor(OperatorEnum.LessThanOrEqual, "<=", OperatorTypeEnum.Binary),
            new OperatorDescriptor(OperatorEnum.And, "and", OperatorTypeEnum.Binary),
            new OperatorDescriptor(OperatorEnum.Or, "or", OperatorTypeEnum.Binary),

            new OperatorDescriptor(OperatorEnum.Like, "like", OperatorTypeEnum.Binary),
            new OperatorDescriptor(OperatorEnum.In, "in", OperatorTypeEnum.Binary),
            new OperatorDescriptor(OperatorEnum.Between, "between", OperatorTypeEnum.Binary),
            new OperatorDescriptor(OperatorEnum.Is, "is", OperatorTypeEnum.Binary),

            // Unary
            new OperatorDescriptor(OperatorEnum.UnaryPlus, "+", OperatorTypeEnum.Unary),
            new OperatorDescriptor(OperatorEnum.UnaryNegation, "-", OperatorTypeEnum.Unary),
            new OperatorDescriptor(OperatorEnum.LogicalNot, "!", OperatorTypeEnum.Unary),
            new OperatorDescriptor(OperatorEnum.Not, "not", OperatorTypeEnum.Unary),

            new OperatorDescriptor(OperatorEnum.Iif, "iif", OperatorTypeEnum.Unary),
            new OperatorDescriptor(OperatorEnum.Case, "case", OperatorTypeEnum.Unary, OperatorLevelEnum.Operator),
            new OperatorDescriptor(OperatorEnum.Eval, "eval", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.IsNull, "isnull", OperatorTypeEnum.Unary, OperatorLevelEnum.Operator),
            new OperatorDescriptor(OperatorEnum.Coalesce, "coalesce", OperatorTypeEnum.Unary, OperatorLevelEnum.Operator),
            new OperatorDescriptor(OperatorEnum.Convert, "convert", OperatorTypeEnum.Unary, OperatorLevelEnum.Operator),
            new OperatorDescriptor(OperatorEnum.Empty, "empty", OperatorTypeEnum.Unary, OperatorLevelEnum.Operator),

            new OperatorDescriptor(OperatorEnum.IsInteger, "isinteger", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.IsNumeric, "isnumeric", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.IsDatetime, "isdatetime", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),

            new OperatorDescriptor(OperatorEnum.Parent, "parent", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Child, "child", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),

            new OperatorDescriptor(OperatorEnum.Vlookup, "vlookup", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Hlookup, "hlookup", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Exists, "exists", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Sqr, "sqr", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Abs, "abs", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Sin, "sin", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Cosin, "cos", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Round, "round", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.RoundUp, "roundup", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.RoundDown, "rounddown", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Ceiling, "ceiling", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Floor, "floor", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Pow, "pow", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.MaxOf, "maxof", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.MinOf, "minof", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),

            new OperatorDescriptor(OperatorEnum.Max, "max", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Min, "min", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Sum, "sum", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.SumIf, "sumif", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Avg, "avg", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Concat, "concat", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Count, "count", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.CountIf, "countif", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Mode, "mode", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),

            new OperatorDescriptor(OperatorEnum.Left, "left", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Right, "right", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.PadL, "padl", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.PadLeft, "padleft", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.PadR, "padr", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.PadRight, "padright", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.SubStr, "substr", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.SubString, "substring", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.CharIndex, "charindex", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),

            new OperatorDescriptor(OperatorEnum.DateAdd, "dateadd", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.DateDiff, "datediff", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.DatePart, "datepart", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Replace, "replace", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Stuff, "stuff", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Len, "len", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Trim, "trim", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Ltrim, "ltrim", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Rtrim, "rtrim", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Str, "str", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Upper, "upper", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Lower, "lower", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.RemoveAccent, "removeaccent", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.SpellNumber, "spellnumber", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.RegexMatch, "regexmatch", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.RegexReplace, "regexreplace", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.RegexExtract, "regexextract", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),

            new OperatorDescriptor(OperatorEnum.Hour, "hour", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Minute, "minute", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Second, "second", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Day, "day", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Month, "month", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Year, "year", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Quarter, "quarter", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.GetDate, "getdate", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.GetUtcDate, "getutcdate", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.GetDatetime, "getdatetime", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.GetUtcDatetime, "getutcdatetime", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Date, "date", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.StartDateOfYear, "startdateofyear", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.SOYear, "soyear", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.EndDateOfYear, "enddateofyear", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.EOYear, "eoyear", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.StartDateOfMonth, "startdateofmonth", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.SOMonth, "somonth", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.EndDateOfMonth, "enddateofmonth", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.EOMonth, "eomonth", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.StartDateOfQuarter, "startdateofquarter", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.SOQuarter, "soquarter", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.EndDateOfQuarter, "enddateofquarter", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.EOQuarter, "eoquarter", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.IsFiscalDate, "isfiscaldate", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.IsSpecialDate, "isspecialdate", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),

            new OperatorDescriptor(OperatorEnum.Format, "format", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.FormatCurrency, "formatcurrency", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.FormatQuantity, "formatquantity", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.FormatDateRange, "formatdaterange", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),

            new OperatorDescriptor(OperatorEnum.LangId, "langid", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.LangName, "langname", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),

            new OperatorDescriptor(OperatorEnum.NameByLang, "namebylang", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),

            new OperatorDescriptor(OperatorEnum.System, "system", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Config, "config", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Currency, "currency", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.User, "user", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Branch, "branch", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.BranchFilter, "branchfilter", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.FiscalYear, "fiscalyear", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.SignatureText, "signaturetext", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.SignatureImage, "signatureimage", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),

            new OperatorDescriptor(OperatorEnum.CurrentValue, "currentvalue", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.RowState, "rowstate", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            //new OperatorDescriptor(OperatorEnum.RowError, "rowerror", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            //new OperatorDescriptor(OperatorEnum.ColumnError, "columnerror", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.UpdatedColumn, "updatedcolumn", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Text, "text", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.ColumnName, "columnname", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.TableName, "tablename", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.LastCommand, "lastcommand", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.OsMachineName, "osmachinename", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.OsDomainName, "osdomainname", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.OsUserName, "osusername", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.ServerName, "servername", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.DatabaseName, "databasename", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.FormCommandName, "formcommandname", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.LayoutName, "layoutname", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.LayoutId, "layoutid", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.VerifyChecksum, "verifychecksum", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.TokenRawData, "tokenrawdata", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.TokenSignData, "tokensigndata", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),

            new OperatorDescriptor(OperatorEnum.Encrypt, "encrypt", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.Decrypt, "decrypt", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
            new OperatorDescriptor(OperatorEnum.HashValue, "hashvalue", OperatorTypeEnum.Unary, OperatorLevelEnum.Function),
        ]
    }

    /**
     * Return the operator descriptor
     */
    public getOperator(pzOperatorName: string) {
        for (const _op of BravoExpression.Operators) {
            if (String.compare(_op.Name, pzOperatorName) == 0)
                return _op;
        }

        return null;
    }

    /**
     * Return the operator name
     */
    public getOperatorName(operator: OperatorEnum) {
        for (const _op of BravoExpression.Operators) {
            if (_op.Operator == operator)
                return _op.Name;
        }

        throw new Error(String.format(MessageContstants.NotSupportedError, operator));
    }

    /**
     * Return the operator type
     */
    public static getOperatorType(operator: OperatorEnum): OperatorTypeEnum {
        for (const _op of BravoExpression.Operators) {
            if (_op.Operator == operator)
                return _op.Type;
        }

        throw new Error(String.format(MessageContstants.NotSupportedError, operator));
    }

    public static isAggregateFunction(operator: OperatorEnum): boolean {
        return operator == OperatorEnum.Max ||
            operator == OperatorEnum.Min ||
            operator == OperatorEnum.Sum ||
            operator == OperatorEnum.SumIf ||
            operator == OperatorEnum.Avg ||
            operator == OperatorEnum.Concat ||
            operator == OperatorEnum.Count ||
            operator == OperatorEnum.CountIf ||
            operator == OperatorEnum.Mode;
    }

    //#endregion static members

    private _operator: OperatorEnum;
    private _expressions: BravoExpression[];
    private _value: any;

    constructor(operator?: OperatorEnum, expressions?: BravoExpression[], value?: any) {
        this._operator = operator;
        this._expressions = expressions;
        this._value = value;
    }

    public get Operator(): OperatorEnum {
        return this._operator;
    }

    public get Expressions(): BravoExpression[] {
        if (this == BravoExpression.Empty) {
            throw new Error(String.format(MessageContstants.ArgumentNullError, "expression"));
        }

        return this._expressions;
    }

    public get Value(): any {
        if (this == BravoExpression.Empty) {
            throw new Error(String.format(MessageContstants.ArgumentNullError, "expression"));
        }

        return this._value;
    }

    public ReplaceWith(expression: BravoExpression) {
        if (!expression)
            throw new Error(String.format(MessageContstants.ArgumentNullError, "expression"));

        this._operator = expression.Operator;
        this._expressions = expression.Expressions;
        this._value = expression.Value;
    }
}

export class OperatorDescriptor {
    private _name: string;
    private _type: OperatorTypeEnum;
    private _operator: OperatorEnum;
    private _level: OperatorLevelEnum;
    private _description: string;

    constructor(operator: OperatorEnum, name: string, type: OperatorTypeEnum,
        level: OperatorLevelEnum = OperatorLevelEnum.Operator, description?: string) {
        this._operator = operator;
        this._name = name;
        this._type = type;
        this._level = level;
        this._description = description;
    }

    public get Name(): string {
        return this._name;
    }

    public get Type(): OperatorTypeEnum {
        return this._type;
    }

    public get Operator(): OperatorEnum {
        return this._operator;
    }

    public get Level(): OperatorLevelEnum {
        return this._level;
    }

    public get Description(): string {
        return this._description;
    }
}

// @dynamic

export class Parser {
    private static isWhiteSpace(ch): boolean {
        return (ch === ' ' || ch === '\r' || ch === '\t' ||
            ch === '\n' || ch === '\v' || ch === '\u00A0');
    }

    private static isDigit(ch): boolean {
        return ('0' <= ch && ch <= '9');
    }

    private static isAlpha(ch): boolean {
        return ('A' <= ch && ch <= 'z');
    }

    private static isAlphaNumeric(ch): boolean {
        return ('0' <= ch && ch <= '9') || ('A' <= ch && ch <= 'z') || ch == '$' || ch == '@';
    }

    private static parseNumber(value: string): any {
        if (!value) return value;

        let isDouble = false;
        let textNumber: string[] = [];

        for (let _n = 0; _n < value.length - 1; _n++) {
            if (converter.isNumber(value[_n])) {
                textNumber.push(value[_n]);

                if (converter.isNumericValue(value[_n])) {
                    isDouble = true;
                }
            }
            else {
                return value;
            }
        }

        let ch = value[value.length - 1];
        let number: string;

        if (converter.isNumber(ch)) {
            textNumber.push(ch);
        }
        else {
            if (textNumber.length == 0) {
                return value;
            }

            number = textNumber.join('');

            switch (ch) {
                case 'f':
                    return parseFloat(number);
                default:
                    return number;
            }
        }

        number = textNumber.join('');

        if (isDouble)
            return parseFloat(number);

        return parseInt(number);
    }

    private static getUnaryOperator(value: string): OperatorEnum {
        let _operators = BravoExpression.Operators;

        for (let _n = 0; _n < _operators.length; _n++) {
            let op = _operators[_n];
            if (op.Type == OperatorTypeEnum.Unary && value && String.compare(op.Name, value.toLowerCase()) == 0) {
                return op.Operator;
            }
        }

        throw new Error(String.format(MessageContstants.NotSupportedError, value));
    }

    private static getBinaryOperator(value: string): OperatorEnum {
        let _operators = BravoExpression.Operators;
        for (let _n = 0; _n < _operators.length; _n++) {
            let op = _operators[_n];
            if (op.Type == OperatorTypeEnum.Binary && value && String.compare(op.Name, value.toLowerCase()) == 0) {
                return op.Operator;
            }
        }

        throw new Error(String.format(MessageContstants.NotSupportedError, value));
    }

    private static getOperatorPriority(value: string): number {
        switch (value.toLowerCase()) {
            case ".":
                return 4;

            case "&":
                return 3;


            case "*":
            case "/":
            case "%":
                return -1;
            case "+":
            case "-":
                return -2;
            case "=":
            case "<":
            case ">":
            case "<>":
            case "==":
            case "!=":
                return -13;

            case "is":
                return -15;

            case "and":
            case "or":
                return -16;
            case ",":
                return -17;

            default:
                return 0;
        }
    }

    private static isExplicitUnary(value: string): boolean {
        var isUnary = false;
        var isBinary = false;
        var _operators = BravoExpression.Operators;
        for (let _n = 0; _n < _operators.length; _n++) {
            let op = _operators[_n];

            if (value && String.compare(op.Name, value.toLowerCase()) == 0) {
                if (op.Type == OperatorTypeEnum.Binary)
                    isBinary = true;
                else if (op.Type == OperatorTypeEnum.Unary)
                    isUnary = true;
            }
        }

        return isUnary && !isBinary;
    }

    private static isExplicitBinary(value: string): boolean {
        var isUnary = false;
        var isBinary = false;
        var _operators = BravoExpression.Operators;
        for (let _n = 0; _n < _operators.length; _n++) {
            let op = _operators[_n];

            if (value && String.compare(op.Name, value.toLowerCase()) == 0) {
                if (op.Type == OperatorTypeEnum.Binary)
                    isBinary = true;
                else if (op.Type == OperatorTypeEnum.Unary)
                    isUnary = true;
            }
        }

        return !isBinary && isBinary;
    }

    private _expression: string;
    private _length: number;
    private _pos: number;
    private _posTk: number;

    constructor() {
    }

    private _tokens: Array<Token>;

    private get Opreators(): OperatorDescriptor[] {
        return BravoExpression.Operators;
    }

    public get tokens(): Array<Token> {
        return this._tokens;
    }

    private getTokens() {
        this._tokens = new Array<Token>();

        let brackets = 0;

        this._pos = 0;
        let ch = this._expression[this._pos];

        while (this._pos < this._length) {
            if (ch === '\'') {
                let start = this._pos;
                let tk = this.scanQuote();

                this._tokens.push(new Token(start, this._pos, tk, TokenTypeEnum.Quote));
            }
            else if (Parser.isWhiteSpace(ch)) {
                let start = this._pos;
                let tk = this.scanWhiteSpace();

                this._tokens.push(new Token(start, this._pos, tk, TokenTypeEnum.WhiteSpace));
            }
            else if (Parser.isDigit(ch)) {
                let start = this._pos;
                let tk = this.scanNumber();

                this._tokens.push(new Token(start, this._pos, tk, TokenTypeEnum.Numeric));
            }
            else if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '%' || ch === '(' ||
                ch === ')' || ch === ',' || ch === '.') {
                this._tokens.push(new Token(this._pos, this._pos, ch, TokenTypeEnum.Operator));

                if (ch == '(') {
                    brackets++;
                }
                else if (ch == ')') {
                    brackets--;
                }
            }
            else if (ch === '=' || ch === '>' || ch === '<' || ch === '!') {
                if (this._pos < this._length && (this._expression[this._pos + 1] === '=' || (ch === '<' &&
                    this._expression[this._pos + 1] === '>'))) {
                    this._tokens.push(new Token(this._pos, this._pos + 1, ch.concat(this._expression[this._pos + 1]),
                        TokenTypeEnum.Operator));
                    this._pos++;
                }
                else {
                    this._tokens.push(new Token(this._pos, this._pos, ch, TokenTypeEnum.Operator));
                }
            }
            else if (ch === ';') {
                this._tokens.push(new Token(this._pos, this._pos, ch, TokenTypeEnum.Terminator));
            }
            else if (ch === '[') {
                let start = this._pos;
                let tk = this.scanName();

                this._tokens.push(new Token(start, this._pos, tk, TokenTypeEnum.Name));
            }
            else if (Parser.isAlphaNumeric(ch)) {
                let start = this._pos;
                let tk: string[] = [];

                while (Parser.isAlphaNumeric(ch) && this._pos < this._length) {
                    tk.push(ch);

                    if (++this._pos < this._length) {
                        ch = this._expression[this._pos];
                    }
                }

                this._pos--;
                let _type = TokenTypeEnum.Word;
                if (this._pos < this._length - 1 && this.nextWordChar() === '(') {
                    _type = TokenTypeEnum.Function;
                }

                this._tokens.push(new Token(start, this._pos, tk.join(''), _type));
            }
            else {
                throw new SyntaxError(String.format(MessageContstants.IncorrectSyntaxError, ch));
            }

            if (++this._pos < this._length) {
                ch = this._expression[this._pos];
            }
        }

        if (brackets > 0) {
            throw new SyntaxError(String.format(MessageContstants.IncorrectSyntaxError, ch));
        }
    }

    private scanDeclare(type: OperatorEnum) {
        let variable: string;
        while (this._posTk < this._tokens.length) {
            let token = this._tokens[this._posTk++];
            if (token.Type == TokenTypeEnum.WhiteSpace) {
                continue;
            }

            if (variable) {
                variable = token.Text;
                continue;
            }

            if (token.Text != '=') {
                throw new SyntaxError(String.format(MessageContstants.IncorrectSyntaxError, token.Text));
            }

            break;
        }

        return new BravoExpression(type, [
            new BravoExpression(OperatorEnum.Value, null, variable),
            this.parseExpression()
        ])
    }

    private parseExpression(): BravoExpression {
        let operatorStack: string[] = [];
        let operandStack: BravoExpression[] = [];

        let operator: string;
        let lhs: BravoExpression, rhs: BravoExpression;

        for (; this._posTk < this._tokens.length; this._posTk++) {
            let _token = this._tokens[this._posTk];

            if (_token.Type === TokenTypeEnum.Terminator) {
                break;
            }

            if (_token.Text === ')') {
                break;
            }

            if (_token.Type === TokenTypeEnum.WhiteSpace) {
                continue;
            }

            if (_token.Text === '(') {
                this._posTk++;
                let expression = this.parseExpression();

                while (operatorStack.length > operandStack.length) {
                    if (Parser.isExplicitBinary(operatorStack[operandStack.length - 1])) {
                        break;
                    }

                    operator = operatorStack.pop();
                    expression = new BravoExpression(Parser.getUnaryOperator(operator), [expression], null);
                }

                operandStack.push(expression);
            }
            else if (this.isOperator(_token)) {
                if (_token.Text.toLowerCase() === 'and' &&
                    operatorStack.length > 0 && operatorStack[operatorStack.length - 1].toLowerCase() === 'between') {
                    operatorStack.push(_token.Text);
                }
                else if (_token.Text.toLowerCase() === 'not' &&
                    operatorStack.length > 0 && operatorStack[operatorStack.length - 1].toLowerCase() === 'is') {
                    operator = operatorStack.pop();
                    operatorStack.push(_token.Text);
                    operatorStack.push(operator);
                }
                else {
                    while (operandStack.length >= 2 && operatorStack.length > 0) {
                        if (Parser.getOperatorPriority(operatorStack[operatorStack.length - 1]) < Parser.getOperatorPriority(_token.Text)) {
                            break;
                        }

                        if (operatorStack[operatorStack.length - 1].toLowerCase() === 'not') {
                            break;
                        }

                        operator = operatorStack.pop();
                        rhs = operandStack.pop();
                        lhs = operandStack.pop();

                        let expression = new BravoExpression(Parser.getBinaryOperator(operator), [lhs, rhs]);

                        if (operator.toLowerCase() === 'and' &&
                            operatorStack.length > 0 && operatorStack[operandStack.length - 1].toLowerCase() === 'between') {
                            operator = operatorStack.pop();
                            lhs = operandStack.pop();
                            expression = new BravoExpression(Parser.getBinaryOperator(operator), [lhs, expression]);
                        }

                        if (Parser.isExplicitBinary(operator) &&
                            operatorStack.length > 0 && operatorStack[operatorStack.length - 1].toLowerCase() === 'not') {
                            operator = operatorStack.pop();
                            expression = new BravoExpression(OperatorEnum.Not, [expression]);
                        }

                        operandStack.push(expression);
                    }

                    operatorStack.push(_token.Text);
                }
            }
            else {
                let value: any;

                if (_token.Type == TokenTypeEnum.Quote) {
                    value = _token.Text;
                }
                else if (String.compare(_token.Text.toLowerCase(), Boolean.trueString) == 0) {
                    value = true;
                }
                else if (String.compare(_token.Text.toLowerCase(), Boolean.falseString) == 0) {
                    value = false;
                }
                else {
                    value = Parser.parseNumber(_token.Text);
                }

                let expression = new BravoExpression(OperatorEnum.Value, null, value);

                while (operatorStack.length > operandStack.length) {
                    if (Parser.isExplicitBinary(operatorStack[operatorStack.length - 1])) {
                        break;
                    }

                    if (operatorStack[operandStack.length - 1].toLowerCase() === 'not') {
                        break;
                    }

                    operator = operatorStack.pop();
                    expression = new BravoExpression(Parser.getUnaryOperator(operator), [expression]);
                }

                operandStack.push(expression);
            }
        }

        while (operandStack.length >= 2 && operatorStack.length > 0) {
            operator = operatorStack.pop();
            rhs = operandStack.pop();
            lhs = operandStack.pop();

            let expression = new BravoExpression(Parser.getBinaryOperator(operator), [lhs, rhs]);
            if (Parser.isExplicitBinary(operator) &&
                operatorStack.length > 0 && operatorStack[operatorStack.length - 1].toLowerCase() === 'not') {
                operator = operatorStack.pop();
                expression = new BravoExpression(OperatorEnum.Not, [expression]);
            }

            operandStack.push(expression);
        }

        if (operandStack.length == 0) {
            return BravoExpression.Empty;
        }

        if (operatorStack.length >= 2) {
            throw new SyntaxError(String.format(MessageContstants.IncorrectSyntaxError, operandStack[operandStack.length - 1].Value));
        }

        if (operatorStack.length >= 1) {
            throw new SyntaxError(String.format(MessageContstants.IncorrectSyntaxError, operatorStack[operatorStack.length - 1]));
        }

        return operandStack[operandStack.length - 1];
    }

    public parseExpressions(expression: string): BravoExpression[] {
        if (!expression) {
            throw new Error(MessageContstants.ValueCanNotNull);
        }

        this._expression = expression;
        this._length = expression.length;
        this._pos = 0;

        this.getTokens();

        let batch: Array<BravoExpression> = new Array<BravoExpression>();

        this._posTk = 0;
        for (; this._posTk < this._tokens.length; this._posTk++) {
            let token = this._tokens[this._posTk];

            if (token.Type == TokenTypeEnum.WhiteSpace) {
                continue;
            }

            switch (token.Text.toLowerCase()) {
                case "declare":
                    this._posTk++;
                    batch.push(this.scanDeclare(OperatorEnum.Declare));
                    break;
                case "set":
                    this._posTk++;
                    batch.push(this.scanDeclare(OperatorEnum.Set));
                    break;
                default:
                    batch.push(this.parseExpression());
                    break;
            }
        }

        return batch;
    }

    private scanQuote(): string {
        let quote: string[] = [];
        let state = 0;

        let ch = this._expression[this._pos];
        while (this._pos < this._length) {
            if (ch == '\'') {
                quote.push(ch);
                if (state == 0) {
                    state = 1;
                }
                else {
                    let escape = false;
                    if (this._pos < this._length - 1) {
                        let _nch = this._expression[this._pos + 1];
                        if (_nch == '\'') {
                            this._pos++;
                            escape = true;
                        }
                    }

                    if (!escape) {
                        return quote.join('');
                    }
                }
            }
            else {
                quote.push(ch);
            }

            if (++this._pos < this._length) {
                ch = this._expression[this._pos];
            }
        }

        throw new Error(String.format(MessageContstants.UnclosedQuotationError, ch));
    }

    private scanName(): string {
        let name: string[] = [];

        let ch = this._expression[this._pos];
        while (this._pos < this._length) {
            name.push(ch);

            if (ch == ']') {
                return name.join('');
            }

            if (++this._pos < this._length) {
                ch = this._expression[this._pos];
            }
        }

        throw new Error(String.format(MessageContstants.UnclosedQuotationError, ch));
    }

    private scanWhiteSpace(): string {
        let white: string[] = [];

        let ch = this._expression[this._pos];
        while (Parser.isWhiteSpace(ch) && this._pos < this._length) {
            white.push(ch);

            if (++this._pos < this._length) {
                ch = this._expression[this._pos];
            }
        }

        this._pos--;

        return white.join('');
    }

    private scanNumber(): string {
        let num: string[] = [];

        let ch = this._expression[this._pos];
        while ((Parser.isDigit(ch) || ch == '.' || ch == 'f' || ch == 'd') && this._pos < this._length) {
            num.push(ch);

            if (ch == 'f' || ch == 'd') {
                this._pos++;
                break;
            }

            if (++this._pos < this._length) {
                ch = this._expression[this._pos];
            }
        }

        this._pos--;

        return num.join('');
    }

    private nextWordChar(): string {
        let pos = this._pos + 1;
        while (pos < this._length && Parser.isWhiteSpace(this._expression[pos++]));

        return this._expression[--pos];
    }

    private isOperator(value: Token): boolean {
        for (let n = 0; n < this.Opreators.length; n++) {
            let op = this.Opreators[n];

            if (value && String.compare(op.Name, value.Text.toLowerCase()) === 0) {
                if (op.Level == OperatorLevelEnum.Operator)
                    return true;

                if (op.Level == OperatorLevelEnum.Function &&
                    value.Type == TokenTypeEnum.Function)
                    return true;
            }
        }

        return false;
    }
}

export class Token {
    private _type: TokenTypeEnum;
    private _text: string;
    private _startLocation: number;
    private _endLocation: number;

    constructor(startLocation: number, endLocation: number, text: string, type: TokenTypeEnum) {
        this._startLocation = startLocation;
        this._endLocation = endLocation;
        this._text = text;
        this._type = type;
    }

    public get Type(): TokenTypeEnum {
        return this._type;
    }

    public get Text(): string {
        return this._text;
    }

    public get StartLocation(): number {
        return this._startLocation;
    }

    public get EndLocation(): number {
        return this._endLocation;
    }
}

enum TokenTypeEnum {
    /// <summary>
    /// Token is white space
    /// </summary>
    WhiteSpace,

    /// <summary>
    /// Token is word
    /// </summary>
    Word,

    /// <summary>
    /// Token is quote
    /// </summary>
    Quote,

    /// <summary>
    /// Token is operator, this not mean same as OperatorEnum
    /// </summary>
    Operator,

    /// <summary>
    /// Token is function
    /// </summary>
    Function,

    /// <summary>
    /// Token is numeric
    /// </summary>
    Numeric,

    /// <summary>
    /// Token is name [Name]
    /// </summary>
    Name,

    /// <summary>
    /// Token is terminator (;)
    /// </summary>
    Terminator
}