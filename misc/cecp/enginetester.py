import chess
import chess.engine
import asyncio

engine = chess.engine.SimpleEngine.popen_uci('C:/Users/Toby/code/yeoldwiz/Wb2Uci.exe')
board = chess.Board()
# engine = chess.engine.SimpleEngine.popen_uci('C:/Users/Toby/code/yeoldwiz/Wb2Uci.exe')
# board = chess.Board('rnbqk1nr/pppp1ppp/4p3/6B1/1b1PP3/8/PPP2PPP/RN1QKBNR w KQkq - 3 4')

# board.fen('rnbqk1nr/pppp1ppp/4p3/6B1/1b1PP3/8/PPP2PPP/RN1QKBNR w KQkq - 3 4')

async def getEngineMove(move):
    # board = chess.Board('rnbqk1nr/pppp1ppp/4p3/6B1/1b1PP3/8/PPP2PPP/RN1QKBNR w KQkq - 3 4')
    board.push_san(move)
    result = engine.play(board, chess.engine.Limit(time=10))
    board.push(result.move)
    print(result.move)


async def main() -> None:
  # engine = chess.engine.SimpleEngine.popen_xboard('C:/Users/Toby/code/yeoldwiz/InBetween.exe')
  await getEngineMove("e4")
  # await getEngineMove("Qd2")
  # await engine.quit()

asyncio.run(main())

# async def main() -> None:
#     engine = await chess.engine.SimpleEngine.popen_xboard('C:/Users/Toby/Games/CM11/TheKing350.exe')
#     board = chess.Board()
    
    
#     while not board.is_game_over():

  # async def getEngineMove(move):
  # board.push_san(move)
#       result = await engine.play(board, chess.engine.Limit(time=0.1))
#       board.push(result.move)

#     await engine.quit()

# asyncio.set_event_loop_policy(chess.engine.EventLoopPolicy())