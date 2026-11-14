import sys

# Tiny Chess Engine (Target < 4KB)
# A minimal engine using minimax and alpha-beta

class Engine:
    def __init__(self):
        # 0: empty, 1-6: White (P,N,B,R,Q,K), -1 to -6: Black
        self.b = [
            -4,-2,-3,-5,-6,-3,-2,-4,
            -1,-1,-1,-1,-1,-1,-1,-1,
             0, 0, 0, 0, 0, 0, 0, 0,
             0, 0, 0, 0, 0, 0, 0, 0,
             0, 0, 0, 0, 0, 0, 0, 0,
             0, 0, 0, 0, 0, 0, 0, 0,
             1, 1, 1, 1, 1, 1, 1, 1,
             4, 2, 3, 5, 6, 3, 2, 4
        ]
        self.turn = 1

    def get_moves(self, p):
        m = []
        for i in range(64):
            piece = self.b[i]
            if (p == 1 and piece > 0) or (p == -1 and piece < 0):
                r, c = divmod(i, 8)
                # Sliding pieces (R, B, Q)
                for dr, dc in [(0,1),(0,-1),(1,0),(-1,0),(1,1),(1,-1),(-1,1),(-1,-1)]:
                    for d in range(1, 8):
                        nr, nc = r + dr*d, c + dc*d
                        if 0 <= nr < 8 and 0 <= nc < 8:
                            idx = nr * 8 + nc
                            if self.b[idx] == 0: m.append((i, idx))
                            elif (self.b[idx] > 0) != (p > 0):
                                m.append((i, idx)); break
                            else: break
                        else: break
                # Leaping pieces (N, K)
                if abs(piece) in [2, 6]:
                    for dr, dc in [(2,1),(2,-1),(-2,1),(-2,-1),(1,2),(1,-2),(-1,2),(-1,-2)]:
                        nr, nc = r + dr, c + dc
                        if 0 <= nr < 8 and 0 <= nc < 8:
                            idx = nr * 8 + nc
                            if self.b[idx] == 0 or (self.b[idx] > 0) != (p > 0): m.append((i, idx))
                # Pawns (special case)
                elif abs(piece) == 1:
                    step = 1 if p == 1 else -1
                    if 0 <= r + step < 8 and self.b[(r+step)*8 + c] == 0:
                        m.append((i, (r+step)*8 + c))
                    for dc in [-1, 1]:
                        nc = c + dc
                        if 0 <= r + step < 8 and 0 <= nc < 8:
                            idx = (r+step)*8 + nc
                            if self.b[idx] != 0 and (self.b[idx] > 0) != (p > 0):
                                m.append((i, idx))
        return m

    def eval(self):
        vals = {1:10, 2:30, 3:30, 4:50, 5:90, 6:900}
        s = 0
        for p in self.b:
            if p > 0: s += vals[abs(p)]
            elif p < 0: s -= vals[abs(p)]
        return s

    def minimax(self, depth, alpha, beta, p):
        if depth == 0: return self.eval()
        moves = self.get_moves(p)
        if not moves: return self.eval()
        
        if p == 1:
            val = -1000000
            for s, e in moves:
                old_e, old_s = self.b[e], self.b[s]
                self.b[e], self.b[s] = old_s, 0
                val = max(val, self.minimax(depth-1, alpha, beta, -1))
                self.b[s], self.b[e] = old_e, old_s
                alpha = max(alpha, val)
                if beta <= alpha: break
            return val
        else:
            val = 1000000
            for s, e in moves:
                old_e, old_s = self.b[e], self.b[s]
                self.b[e], self.b[s] = old_s, 0
                val = min(val, self.minimax(depth-1, alpha, beta, 1))
                self.b[s], self.b[e] = old_e, old_s
                beta = min(beta, val)
                if beta <= alpha: break
            return val

def test_engine():
    e = Engine()
    print("Testing engine...")
    moves = e.get_moves(1)
    assert len(moves) > 0, "No moves for White"
    print(f"Initial moves: {len(moves)}")
    
    start_eval = e.eval()
    print(f"Initial eval: {start_eval}")
    
    s, end = moves[0]
    old_e, old_s = e.b[end], e.b[s]
    e.b[end], e.b[s] = old_s, 0
    new_eval = e.eval()
    print(f"Eval after move: {new_eval}")
    
    print("Running minimax (depth 2)...")
    val = e.minimax(2, -1000000, 1000000, -1)
    print(f"Minimax value: {val}")
    print("✅ Local test passed!")

if __name__ == "__main__":
    test_engine()
