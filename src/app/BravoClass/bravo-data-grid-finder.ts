import * as wjGrid from 'wijmo/wijmo.grid';
import * as wjCore from 'wijmo/wijmo'

export class BravoDataGridFinder {

        // private struct RangeInfo
        // {
        //     public c1g.C1FlexGrid grid;
        //     public int nBeginRow;
        //     public int nBeginCol;
        //     public int nEndRow;
        //     public int nEndCol;

        //     public RangeInfo(c1g.C1FlexGrid pGrid, int pnBeginRow, int pnBeginCol, int pnEndRow, int pnEndCol)
        //     {
        //         grid = pGrid;
        //         nBeginRow = pnBeginRow;
        //         nBeginCol = pnBeginCol;
        //         nEndRow = pnEndRow;
        //         nEndCol = pnEndCol;
        //     }

        //     public override string ToString()
        //     {
        //         return string.Format("Grid:{0}; nBeginRow:{1}; nBeginCol:{2}; nEndRow:{3}; nEndCol:{4};",
        //             grid.Name, nBeginRow, nBeginCol, nEndRow, nEndCol);
        //     }
        // }

        // private List<RangeInfo> _findRangeCollection = new List<RangeInfo>();
        // private bool _bFindNextFlag = false;

        // public BravoDataGridFinder()
        // {
        // }

        // public class CompareTextEventArgs : EventArgs
        // {
        //     public MatchInfo findInfo;
        //     public bool bMatched { get; set; } = false;
        //     public bool bHandled { get; set; } = false;

        //     public CompareTextEventArgs(MatchInfo pFindInfo)
        //     {
        //         findInfo = pFindInfo;
        //     }
        // }

        // public event EventHandler<CompareTextEventArgs> onCompareText;
        // public event EventHandler onFound;

        // private int _nCurrentGrid = -1;

        // public int nCurrentGrid
        // {
        //     get
        //     {
        //         if (_nCurrentGrid < 0 || _nCurrentGrid >= gridCollection.Count)
        //             return -1;
        //         return _nCurrentGrid;
        //     }
        //     private set
        //     {
        //         _nCurrentGrid = value;
        //     }
        // }

        // public MatchInfo currentMatch { get; private set; } = new MatchInfo();

        // public bool bHighlightMatch { get; set; } = true;
        // public bool bIgnoreAccent { get; set; } = true;
        // public bool bIgnoreCase { get; set; } = true;
        // public bool bShowNotFoundMessage { get; set; } = true;

        // public List<c1g.C1FlexGrid> gridCollection { get; private set; } = new List<c1g.C1FlexGrid>();

        // public c1g.C1FlexGrid getCurrent()
        // {
        //     if (gridCollection.Count < 1)
        //         return null;

        //     if (nCurrentGrid >= 0 && nCurrentGrid < gridCollection.Count &&
        //             gridCollection[nCurrentGrid].Visible)
        //         return gridCollection[nCurrentGrid];

        //     for (int _i = 0; _i < gridCollection.Count; _i++)
        //         if (gridCollection[_i].Visible)
        //         {
        //             nCurrentGrid = _i;
        //             return gridCollection[_i];
        //         }

        //     return null;
        // }

        // private void invalidateMatch(MatchInfo mi)
        // {
        //     var _g = getFindRangeGrid(mi.nRangeIndex);
        //     if (_g != null && _g.IsCellValid(mi.nRow, mi.nColumn))
        //         _g.Invalidate(mi.nRow, mi.nColumn);
        // }

        // public bool isMatchCell(c1g.C1FlexGrid pGrid, int pnRow, int pnCol)
        // {
        //     var _g = getFindRangeGrid(currentMatch.nRangeIndex);
        //     return _g != null && _g.Equals(pGrid) && currentMatch.nRow == pnRow && currentMatch.nColumn == pnCol;
        // }

        // public void selectCurrentMatch()
        // {
        //     var _g = getFindRangeGrid(currentMatch.nRangeIndex);
        //     if (_g != null && _g.Enabled && _g.Visible)
        //     {
        //         if (_g.IsCellValid(currentMatch.nRow, currentMatch.nColumn) && !_g.IsCellFixed(currentMatch.nRow, currentMatch.nColumn))
        //             _g.Select(currentMatch.nRow, currentMatch.nColumn, true);

        //         _g.Focus();

        //         //UI.MessageBox.Show(string.Format("{0},{1} | {2},{3}",
        //             //_match.nRow, _match.nColumn, _g.Row, _g.Col));
        //     }
        // }

        // private c1g.C1FlexGrid getFindRangeGrid(int pnRangeIndex)
        // {
        //     if (pnRangeIndex < 0 || pnRangeIndex >= _findRangeCollection.Count)
        //         return null;

        //     return _findRangeCollection[pnRangeIndex].grid;
        // }

        // public void clearFind()
        // {
        //     currentMatch = new MatchInfo();

        //     foreach (c1g.C1FlexGrid _g in gridCollection)
        //     {
        //         var _dg = _g as BravoDataGrid;
        //         if (_dg != null)
        //         {
        //             _dg.highlightColumns.Clear();
        //             _dg.Invalidate();
        //         }
        //     }
        // }

        // public void reset()
        // {
        //     _findRangeCollection.Clear();
        //     currentMatch = new MatchInfo();

        //     foreach (c1g.C1FlexGrid _g in gridCollection)
        //     {
        //         var _dg = _g as BravoDataGrid;
        //         if (_dg != null)
        //         {
        //             _dg.highlightColumns.Clear();
        //             _dg.Invalidate();
        //         }
        //     }

        //     gridCollection.Clear();

        //     //nCurrentGrid = -1;
        // }

        // public void add(params c1g.C1FlexGrid[] pGridCollection)
        // {
        //     gridCollection.AddRange(pGridCollection);
        // }

        // public void remove(params c1g.C1FlexGrid[] pGridCollection)
        // {
        //     for (var _n = gridCollection.Count - 1; _n >= 0; _n--)
        //         if (gridCollection.Contains(gridCollection[_n]))
        //             gridCollection.Remove(gridCollection[_n]);
        // }

        // public void setCurrent(c1g.C1FlexGrid pGrid)
        // {
        //     nCurrentGrid = gridCollection.IndexOf(pGrid);
        // }

        // public bool compareCell(string pzSearchedText, c1g.C1FlexGrid pGrid, int pnRow, int pnCol)
        // {
        //     var _zSearchedText = pzSearchedText;

        //     if (onCompareText != null)
        //     {                
        //         var _e = new CompareTextEventArgs(new MatchInfo(_zSearchedText, gridCollection.IndexOf(pGrid), pnRow, pnCol));
        //         onCompareText?.Invoke(this, _e);
        //         return _e.bMatched;
        //     }
        //     else
        //     {
        //         var _bIsAccents = true;
        //         if (bIgnoreAccent)
        //             _bIsAccents = string.Compare(_zSearchedText.removeAccent(), _zSearchedText, false) != 0;

        //         var _dg = pGrid as BravoDataGrid;
        //         if (_dg != null)
        //         {
        //             var _ct = _dg.getCellType(pnRow, pnCol);
        //             if (_ct == BravoDataGrid.GridCellTypeEnum.barcode ||
        //                 _ct == BravoDataGrid.GridCellTypeEnum.Check ||
        //                 _ct == BravoDataGrid.GridCellTypeEnum.img ||
        //                 _ct == BravoDataGrid.GridCellTypeEnum.progress ||
        //                     _ct == BravoDataGrid.GridCellTypeEnum.qrcode)
        //                 return false;
        //         }

        //         var _zSearchedIn = string.Empty;
        //         var _t = BravoDataGrid.getColumnDataType(pGrid.Cols[pnCol]);
        //         if (_t == typeof(byte[]))
        //             return false;

        //         if (_dg != null)
        //         {
        //             c1g.CellRange _rg;
        //             Image _img;
        //             Rectangle _rec;
        //             c1g.CheckEnum _check;
        //             c1g.CellStyle _style;
        //             _dg.readCellData(pnRow, pnCol, out _rg, out _rec, out _zSearchedIn, out _img, out _check, out _style);
        //             if (!_bIsAccents)
        //                 _zSearchedIn = _zSearchedIn.removeAccent();
        //         }
        //         else
        //         {
        //             if (!_bIsAccents)
        //                 _zSearchedIn = pGrid.GetDataDisplay(pnRow, pnCol).removeAccent();
        //         }

        //         return _zSearchedIn.IndexOf(_zSearchedText, bIgnoreCase ?
        //             StringComparison.CurrentCultureIgnoreCase : StringComparison.CurrentCulture) >= 0;
        //     }
        // }

        // private bool findRange(string pzSearchedText, RangeInfo pRangeInfo, int pnRangeIndex)
        // {
        //     //var _bIsAccents = true;
        //     //if (bIgnoreAccent)
        //         //_bIsAccents = string.Compare(pzSearchedText.removeAccent(), pzSearchedText, false) != 0;

        //     var _grid = pRangeInfo.grid;
        //     var _dg = _grid as BravoDataGrid;
        //     /*var _nBeginRow = pRangeInfo.nBeginRow;
        //     var _nBeginCol = pRangeInfo.nBeginCol;
        //     var _nEndRow = pRangeInfo.nEndRow;
        //     var _nEndCol = pRangeInfo.nEndCol;*/
        //     var _nBeginRow = Math.Max(pRangeInfo.nBeginRow, _grid.Rows.Fixed);
        //     var _nEndRow = Math.Min(pRangeInfo.nEndRow, _grid.Rows.Count - 1);
        //     var _nBeginCol = Math.Max(pRangeInfo.nBeginCol, _grid.Cols.Fixed);
        //     var _nEndCol = Math.Min(pRangeInfo.nEndCol, _grid.Cols.Count - 1);

        //     for (var _nRow = _nBeginRow; _nRow <= _nEndRow; _nRow++)
        //     {
        //         //System.Diagnostics.Trace.WriteLine(string.Format("_______{0}|{1}|{2}-{3}|{4}; {5}", 
        //             //_grid.Name, _nRow, _nBeginRow, _nEndRow, _grid.Rows.Count, _findRangeCollection[pnRangeIndex]));

        //         if (_nRow < _grid.Rows.Fixed || _grid.Rows[_nRow].IsNew || (_dg != null && _dg.isAddNewRow(_nRow)))
        //             continue;

        //         if (!_grid.Rows[_nRow].Visible || _grid.Rows[_nRow].Bottom - _grid.Rows[_nRow].Top < 1)//_grid.getCurrentHeightOfRow(_nRow) < 1)
        //             continue;

        //         for (var _nCol = 0; _nCol < _grid.Cols.Count; _nCol++)
        //         {
        //             if (_nCol < _grid.Cols.Fixed)
        //                 continue;

        //             if (!_grid.Cols[_nCol].Visible || _grid.Cols[_nCol].Right - _grid.Cols[_nCol].Left < 1) //_grid.getCurrentWidthOfCol(_nCol) < 1)
        //                 continue;

        //             if (_nRow <= _nBeginRow && _nCol < _nBeginCol)
        //                 continue;

        //             if (_nRow >= _nEndRow && _nCol > _nEndCol)
        //                 continue;

        //             /*bool _bIsMatched = false, _bIsHandled = false;

        //             if (onCompareText != null)
        //             {
        //                 var _e = new CompareTextEventArgs(new MatchInfo(pzSearchedText, pnRangeIndex, _nRow, _nCol));
        //                 onCompareText?.Invoke(this, _e);
        //                 _bIsHandled = _e.bHandled;
        //                 if (_bIsHandled)
        //                     _bIsMatched = _e.bMatched;
        //             }

        //             if (!_bIsHandled)
        //             {
        //                 if (_dg != null)
        //                 {
        //                     var _ct = _dg.getCellType(_nRow, _nCol);
        //                     if (_ct == BravoDataGrid.GridCellTypeEnum.barcode ||
        //                         _ct == BravoDataGrid.GridCellTypeEnum.Check ||
        //                         _ct == BravoDataGrid.GridCellTypeEnum.img ||
        //                         _ct == BravoDataGrid.GridCellTypeEnum.progress ||
        //                             _ct == BravoDataGrid.GridCellTypeEnum.qrcode)
        //                         continue;
        //                 }

        //                 var _zSearchedIn = string.Empty;
        //                 var _t = BravoDataGrid.getColumnDataType(_grid.Cols[_nCol]);
        //                 if (_t == typeof(byte[]))
        //                     continue;

        //                 if (_dg != null)
        //                 {
        //                     c1g.CellRange _rg;
        //                     Image _img;
        //                     Rectangle _rec;
        //                     c1g.CheckEnum _check;
        //                     c1g.CellStyle _style;
        //                     _dg.readCellData(_nRow, _nCol, out _rg, out _rec, out _zSearchedIn, out _img, out _check, out _style);
        //                     if (!_bIsAccents)
        //                         _zSearchedIn = _zSearchedIn.removeAccent();
        //                 }
        //                 else
        //                 {
        //                     if (!_bIsAccents)
        //                         _zSearchedIn = _grid.GetDataDisplay(_nRow, _nCol).removeAccent();
        //                 }

        //                 //System.Diagnostics.Trace.WriteLine(string.Format("________Find: {0}: {1}|{2}|{3}", 
        //                 //_grid.Name, _nRow, _nCol, _zSearchedIn));

        //                 _bIsMatched = _zSearchedIn.IndexOf(pzSearchedText, bIgnoreCase ?
        //                     StringComparison.CurrentCultureIgnoreCase : StringComparison.CurrentCulture) >= 0;
        //             }

        //             if (_bIsMatched)*/
        //             if (compareCell(pzSearchedText, _grid, _nRow, _nCol))
        //             {
        //                 var _miOld = currentMatch;
        //                 currentMatch = new MatchInfo(pzSearchedText, pnRangeIndex, _nRow, _nCol);

        //                 invalidateMatch(_miOld);

        //                 _grid.ShowCell(_nRow, _nCol);
        //                 //_grid.Select();
        //                 nCurrentGrid = gridCollection.IndexOf(_grid);

        //                 invalidateMatch(currentMatch);

        //                 //MessageBox.Show(string.Format("{0}|{1}:{2}|{3}", nCurrentGrid, _grid.Name, _nRow, _nCol));
        //                 onFound?.Invoke(this, EventArgs.Empty);

        //                 return true;
        //             }
        //         }
        //     }

        //     return false;
        // }

        // public bool findNext()
        // {
        //     if (string.IsNullOrEmpty(currentMatch.zSearchedText))
        //         return false;

        //     int _nStartNext = _bFindNextFlag ? 0 : currentMatch.nRangeIndex;
        //     for (int _i = _nStartNext; _i < _findRangeCollection.Count; _i++)
        //     {
        //         var _ri = _findRangeCollection[_i];

        //         if (!_bFindNextFlag && _i == currentMatch.nRangeIndex)
        //         {
        //             var _nRow = currentMatch.nRow;
        //             var _nCol = currentMatch.nColumn + 1;
        //             if (_nCol >= _ri.grid.Cols.Count)
        //             {
        //                 _nRow++;
        //                 _nCol = 0;
        //             }

        //             if (!_ri.grid.IsCellValid(_nRow, _nCol))
        //                 continue;

        //             _ri = new RangeInfo(_ri.grid, _nRow, _nCol, _ri.nEndRow, _ri.nEndCol);
        //             //new c1g.RangeEventArgs(_kp.Value.GetCellRange(_nRow, _nCol), _kp.Key.NewRange);
        //         }

        //         if (findRange(currentMatch.zSearchedText, _ri, _i))
        //         {
        //             _bFindNextFlag = false;
        //             return true;
        //         }
        //     }

        //     if (bShowNotFoundMessage)
        //         MessageBox.Show(getCurrent(), string.Format("{0} '{1}'.", BravoResourceManager.getString(
        //             BravoResourceManager.StringEnum.NoMatchedValueText), currentMatch.zSearchedText),
        //             MessageBoxButtons.OK, MessageBoxIcon.Exclamation);

        //     _bFindNextFlag = true;

        //     return false;
        // }

        // public bool find(string pzSearchedText, bool pbAutoFindNext = true, bool pbIgnoreHighlight = false, bool pbSuppressMessage = false)
        // {
        //     //System.Diagnostics.Trace.WriteLine(string.Format("______[{0}] [{1}] [{2}] [{3}]",
        //         //gridCollection.Count, getCurrent(), currentMatch.zSearchedText, pzSearchedText));

        //     if (gridCollection.Count < 1) return false;

        //     var _grdCurrent = getCurrent();
        //     if (_grdCurrent == null) return false;

        //     if (pbAutoFindNext && string.Compare(currentMatch.zSearchedText, pzSearchedText, false) == 0)
        //     {
        //         var _bIsNext = true;
        //             //_grdCurrent.IsCellCursor(_match.nRow, _match.nColumn) &&
        //             //_grdCurrent.Equals(getFindRangeGrid(_match.nRangeIndex));
        //         if (_bIsNext) return findNext();
        //     }

        //     _bFindNextFlag = false;
        //     _findRangeCollection.Clear();

        //     var _zFindText = pzSearchedText;
        //     //var _bIsAccents = true;
        //     //if (bIgnoreAccent)
        //         //_bIsAccents = string.Compare(_zFindText.removeAccent(), _zFindText, false) != 0;

        //     if (!pbIgnoreHighlight && bHighlightMatch)
        //     {
        //         foreach (c1g.C1FlexGrid _g in gridCollection)
        //         {
        //             var _dg = _g as BravoDataGrid;
        //             if (_dg != null)
        //             {
        //                 _dg.highlightColumns.Clear();
        //                 _dg.highlightColumns.Add(BravoDataGrid.AllColumnValue, new string[] { _zFindText });
        //                 _dg.Invalidate();
        //             }
        //         }
        //     }

        //     int _r = 0, _c = 0;
        //     if (_grdCurrent.CursorCell.IsValid)
        //     {
        //         if (_grdCurrent.Row >= _grdCurrent.Rows.Fixed && _grdCurrent.Row < _grdCurrent.Rows.Count)
        //             _r = _grdCurrent.Row;

        //         if (_grdCurrent.Col >= _grdCurrent.Cols.Fixed && _grdCurrent.Col < _grdCurrent.Cols.Count)
        //             _c = _grdCurrent.Col;
        //     }

        //     _findRangeCollection.Add(new RangeInfo(_grdCurrent, _r, _c,
        //         _grdCurrent.Rows.Count - 1, _grdCurrent.Cols.Count - 1));

        //     for (var _i = nCurrentGrid + 1; _i < gridCollection.Count; _i++)
        //     {
        //         var _g = gridCollection[_i];
        //         if (_g != null & _g.Visible)
        //             _findRangeCollection.Add(new RangeInfo(_g, 0, 0, _g.Rows.Count - 1, _g.Cols.Count - 1));
        //     }

        //     for (var _i = 0; _i < nCurrentGrid; _i++)
        //     {
        //         var _g = gridCollection[_i];
        //         if (_g != null & _g.Visible)
        //             _findRangeCollection.Add(new RangeInfo(_g, 0, 0, _g.Rows.Count - 1, _g.Cols.Count - 1));
        //     }

        //     if (_r > 0)
        //     {
        //         var _nEndRow = _r;
        //         var _nEndCol = _c - 1;
        //         if (_nEndCol < 0)
        //         {
        //             _nEndRow -= 1;
        //             _nEndCol = _grdCurrent.Cols.Count - 1;
        //         }

        //         if (_nEndRow >= 0)
        //             _findRangeCollection.Add(new RangeInfo(_grdCurrent, 0, 0, _nEndRow, _nEndCol));
        //     }

        //     for (int _i = 0; _i < _findRangeCollection.Count; _i++)
        //         if (findRange(_zFindText, _findRangeCollection[_i], _i))
        //             return true;

        //     if (!pbSuppressMessage && bShowNotFoundMessage)
        //         MessageBox.Show(_grdCurrent, string.Format("{0} '{1}'.", BravoResourceManager.getString(
        //             BravoResourceManager.StringEnum.NoMatchedValueText), _zFindText),
        //             MessageBoxButtons.OK, MessageBoxIcon.Exclamation);

        //     return false;
        // }
}


