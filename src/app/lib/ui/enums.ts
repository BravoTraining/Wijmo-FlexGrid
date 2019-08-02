export enum CellStyleEnum {
    Normal = 0,
    Alternate = 1,
    Fixed = 2,
    Highlight = 3,
    Focus = 4,
    Editor = 5,
    Search = 6,
    Frozen = 7,
    FrozenAlternate = 8,
    NewRow = 9,
    EmptyArea = 10,
    SelectedColumnHeader = 11,
    SelectedRowHeader = 12,
    GrandTotal = 13,
    Subtotal0 = 14,
    Subtotal1 = 15,
    Subtotal2 = 16,
    Subtotal3 = 17,
    Subtotal4 = 18,
    Subtotal5 = 19,
    FilterEditor = 20,
    FirstCustomStyle = 21,
    RowHeader = 22
}

/// <summary>
/// Enum of autotext modes for cell content
/// </summary>
export enum GridAutoTextContentEnum {
    /// <summary>
    /// Keep original content
    /// </summary>
    None,

    /// <summary>
    /// Translate autotext for fixed cells only
    /// </summary>
    Fixed,

    /// <summary>
    /// Translate autotext for non-fixed cells only
    /// </summary>
    NonFixed,

    /// <summary>
    /// Translate autotext for all cells
    /// </summary>
    All
}

/// <summary>
/// Enum of row types to auto fit height
/// </summary>
export enum GridAutoFitRowHeightEnum {
    /// <summary>
    /// Not auto fit height
    /// </summary>
    None,

    /// <summary>
    /// Fixed rows only
    /// </summary>
    Fixed,

    /// <summary>
    /// Non-fixed rows only
    /// </summary>
    NonFixed,

    /// <summary>
    /// All rows
    /// </summary>
    All
}

export enum AnchorStyles {
    //
    // Summary:
    //     The control is not anchored to any edges of its container.
    None = 0,
    //
    // Summary:
    //     The control is anchored to the top edge of its container.
    Top = 1,
    //
    // Summary:
    //     The control is anchored to the bottom edge of its container.
    Bottom = 2,
    //
    // Summary:
    //     The control is anchored to the left edge of its container.
    Left = 4,
    //
    // Summary:
    //     The control is anchored to the right edge of its container.
    Right = 8
}

export enum GridDataCellEnum {
    None = 0,
    Bound = 1,
    Unbound = 2,
    Both = 3
}

export enum RowHeaderNumberingEnum {
    None,
    DataOnly,
    All
}

export enum ScrollBars {
    //
    // Summary:
    //     No scroll bars are shown.
    None = 0,
    //
    // Summary:
    //     Only horizontal scroll bars are shown.
    Horizontal = 1,
    //
    // Summary:
    //     Only vertical scroll bars are shown.
    Vertical = 2,
    //
    // Summary:
    //     Both horizontal and vertical scroll bars are shown.
    Both = 3
}

export enum SizeType {
    AutoSize = 0,
    Absolute = 1,
    Percent = 2
}

export enum StyleElementFlags {
    None = 0,
    Font = 1,
    BackColor = 2,
    ForeColor = 4,
    Margins = 8,
    Border = 16,
    TextAlign = 32,
    TextEffect = 64,
    ImageAlign = 128,
    ImageSpacing = 256,
    Trimming = 512,
    WordWrap = 1024,
    Display = 2048,
    Format = 4096,
    EditMask = 8192,
    ComboList = 16384,
    ImageMap = 32768,
    DataType = 65536,
    DataMap = 131072,
    TextDirection = 262144,
    Editor = 524288,
    UserData = 1048576,
    BackgroundImage = 2097152,
    BackgroundImageLayout = 4194304,
    LineHeight = 8388608,
    All = 16777215
}

export enum BravoApplicationCommandActionEnum {
    /// <summary>
    /// Default handle
    /// </summary>
    DefaultHandle,

    /// <summary>
    /// Custom handle, ignore default handle 
    /// </summary>
    CustomHandle,

    /// <summary>
    /// Not handle
    /// </summary>
    Cancel
}

export enum MergeAction {
    //
    // Summary:
    //     Appends the item to the end of the collection, ignoring match results.
    Append = 0,
    //
    // Summary:
    //     Inserts the item to the target's collection immediately preceding the matched
    //     item. A match of the end of the list results in the item being appended to the
    //     list. If there is no match or the match is at the beginning of the list, the
    //     item is inserted at the beginning of the collection.
    Insert = 1,
    //
    // Summary:
    //     Replaces the matched item with the source item. The original item's drop-down
    //     items do not become children of the incoming item.
    Replace = 2,
    //
    // Summary:
    //     Removes the matched item.
    Remove = 3,
    //
    // Summary:
    //     A match is required, but no action is taken. Use this for tree creation and successful
    //     access to nested layouts.
    MatchOnly = 4
}

//#region Enum Chart
export enum AutoLabelEnum {
    Never,
    Always,
    Automatic
}

export enum AutoColorEnum {
    None = 0,
    ForeColor = 1,
    BackColor = 2
}

export enum ColorGenerationEmum {
    Custom = -1,
    CopyCurrentToCustom = -2,
    Standard = 0,
    Office = 1,
    GrayScale = 2,
    Apex = 3,
    Aspect = 4,
    Civic = 5,
    Concourse = 6,
    Equity = 7,
    Flow = 8,
    Foundry = 9,
    Median = 10,
    Metro = 11,
    Module = 12,
    Opulent = 13,
    Oriel = 14,
    Origin = 15,
    Paper = 16,
    Solstice = 17,
    Technic = 18,
    Trek = 19,
    Urban = 20,
    Verve = 21
}

export enum CompassEnum {
    North = 0,
    South = 1,
    East = 2,
    West = 3,
    Radial = 8,
    Orthogonal = 9
}

export enum Palettes {
    Standard,
    Cocoa,
    Coral,
    Drank,
    HighContrast,
    Light,
    Midnight,
    Modern,
    Organic,
    Slate,
    Zen,
    Cyborg,
    Superhero,
    Flatly,
    Darkly,
    Cerulan,
    Custom
}

export enum Chart2DTypeEnum {
    XYPlot = 0,
    Pie = 1,
    Bar = 2,
    Area = 3,
    Polar = 4,
    Radar = 5,
    Bubble = 6,
    HiLo = 7,
    HiLoOpenClose = 8,
    Candle = 9,
    Gantt = 10,
    Step = 11,
    Histogram = 12,
    Scatter = 13,
    Column = 14,
    Spline = 15,
    SplineArea = 16,
    SplineSymbols = 17
}
//#endregion Enum Chart

export enum BarCodeTypeEnum {
    None = 0,
    Ansi39 = 1,
    Ansi39x = 2,
    Code_2_of_5 = 3,
    Code25intlv = 4,
    Matrix_2_of_5 = 5,
    Code39 = 6,
    Code39x = 7,
    Code_128_A = 8,
    Code_128_B = 9,
    Code_128_C = 10,
    Code_128auto = 11,
    Code_93 = 12,
    Code93x = 13,
    MSI = 14,
    PostNet = 15,
    Codabar = 16,
    EAN_8 = 17,
    EAN_13 = 18,
    UPC_A = 19,
    UPC_E0 = 20,
    UPC_E1 = 21,
    RM4SCC = 22,
    UCCEAN128 = 23,
    QRCode = 24,
    Code49 = 25,
    JapanesePostal = 26,
    Pdf417 = 27,
    EAN128FNC1 = 28,
    RSS14 = 29,
    RSS14Truncated = 30,
    RSS14Stacked = 31,
    RSS14StackedOmnidirectional = 32,
    RSSExpanded = 33,
    RSSExpandedStacked = 34,
    RSSLimited = 35,
    DataMatrix = 36,
    MicroPDF417 = 37,
    IntelligentMail = 64
}

export enum Cursors {
    AppStarting = " progress",
    PanSW = "",
    PanSouth = "",
    PanSE = "",
    PanNW = "",
    PanNorth = "",
    PanNE = "",
    PanEast = "",
    NoMoveVert = "",
    NoMoveHoriz = "",
    NoMove2D = "move",
    VSplit = "col-resize",
    HSplit = "row-resize",
    Help = "help",
    WaitCursor = "wait",
    UpArrow = "",
    SizeWE = "e-resize",
    SizeNWSE = "nw-resize",
    SizeNS = "n-resize",
    SizeNESW = "ne-resize",
    SizeAll = "all-scroll",
    No = "no-drop",
    IBeam = "",
    Default = "default",
    Cross = "",
    Arrow = "",
    PanWest = "",
    Hand = "pointer"
}

export enum ProgressBarEnum {
    Loading = 0,
    Percent = 1
}

export enum LookupStatusEnum {
    Default,
    EnterToSearch,
    Searching,
    Loading,
    NoMatchedValue,
    SearchError
}