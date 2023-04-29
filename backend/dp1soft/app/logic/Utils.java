/*
    Utils.java
    v1.0
    Created : 29/04/23
    Modified: 29/04/23
*/

package dp1soft.app.logic;

import dp1soft.app.model.Environment;
import dp1soft.app.model.Node;
import dp1soft.app.model.Solution;
import dp1soft.app.model.Vehicle;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Random;

//Clase con métodos de utilidad para el algoritmo
public class Utils {

    //region Constantes
    public static final int ERROR = -1;
    public static final int RIGHT = 0;
    public static final int LEFT = 1;
    public static final int UP = 2;
    public static final int DOWN = 3;
    private static final ArrayList<Integer> MOVES = new ArrayList<>(Arrays.asList(RIGHT, LEFT, UP, DOWN));
    //endregion

    //region Métodos
    //Elige un vehículo aleatorio que esté disponible
    public static int pickVehicle(ArrayList<Vehicle> vehicles){
        Random rand = new Random();
        ArrayList<Vehicle> newVehicles = new ArrayList<>(vehicles);
        boolean valid = false;
        int i = ERROR;
        if(vehicles.size() > 1){ //El arreglo es mayor a 1? Cuando los vehículos regresan, solo hay uno
            while (!valid && newVehicles.size() > 0){//Encontrar un vehículo disponible o agotar la lista local
                //Obtiene un índice aleatorio
                i = rand.nextInt(newVehicles.size());
                //Revisa si es válido, es decir, si está libre en el almacén o si está regresando con paquetes restantes
                valid = newVehicles.get(i).getState() == 0 || (newVehicles.get(i).getState() == 2 && newVehicles.get(i).getCarry() > 0);
                if(valid){
                    //El índice es el id - 1
                    i = newVehicles.get(i).getId() - 1;
                }else {
                    //Para no repetir y hacer la ejecución más rápida, se quita de la lista
                    newVehicles.remove(i);
                    i = ERROR;
                }
            }
        }else {
            i = 0;
        }
        return i;
    }
    //Obtiene un movimiento válido
    public static int rollValidMove(Environment env, Node location, Node destination){
        Random rand = new Random();
        Node node;
        ArrayList<Integer> localMoves = new ArrayList<>(MOVES);
        boolean valid = false;
        int num = ERROR, i;
        while (!valid && localMoves.size() > 0){ //Encontrar un movimiento válido o agotar la lista local
            i = rand.nextInt(localMoves.size());
            num = localMoves.get(i);
            node = new Node(location);
            switch (num) {
                case RIGHT  -> node.setX(node.getX() + 1);
                case LEFT   -> node.setX(node.getX() - 1);
                case UP     -> node.setY(node.getY() + 1);
                case DOWN   -> node.setY(node.getY() - 1);
            }
            if((isBlocked(env, node, destination)) || !isValid(env, node)){ //Si esta bloqueado o se sale del mapa, se quita
                localMoves.remove(i);
                num = ERROR;
                continue;
            }
            //Si es válido, revisar si lo acerca a su destino, puede ignorar esta heurística
            if(node.distance(destination) <= node.distance(destination) || rand.nextInt(100) < Genetic.IGNORE_CHANCE * 100){
                valid = true;
            }
        }
        return num;
    }
    //Revisa si la siguiente posición esta bloqueada o es el destino
    private static boolean isBlocked(Environment env, Node nextMove, Node destination) {
        boolean blocked = false;
        for(Node n : env.getMap()) {
            if(nextMove.equals(n)){
                //Si lo encuentra y está bloqueado, pero lo ignora si es el destino
                blocked = n.isBlocked() && !nextMove.equals(destination);
                break;
            }
        }
        return blocked;
    }
    //Revisa que esté dentro del mapa
    private static boolean isValid(Environment env, Node node){
        boolean valid = false;
        for(Node n : env.getMap()){
            if(node.equals(n)){
                valid = true;
                break;
            }
        }
        return valid;
    }
    //Ordena la lista de padres según su fitness y regresa una sublista de los x primeros
    public static ArrayList<Solution> getParents (ArrayList<Solution> population){
        Collections.sort(population);
        return new ArrayList<>(population.subList(0, (int)(Genetic.POPULATION * Genetic.PARENTS)));
    }
    //Obtiene un índice diferente al padre
    public static int rollValidMother(int f) {
        Random rand = new Random();
        int m = f;
        while (m == f) {
            m = rand.nextInt((int)(Genetic.POPULATION * Genetic.PARENTS));
        }
        return m;
    }
    //Cruza la población
    public static ArrayList<Solution> cross(Solution father, Solution mother){
        ArrayList<Solution> children = new ArrayList<>();
        Solution child1 = new Solution();
        Solution child2 = new Solution();
        int i, j, fsize = father.getChroms().size(), msize = mother.getChroms().size();
        boolean splice = false;
        //Si el padre y la madre no tienen mas de dos pasos, no tiene punto cruzarlos
        if(fsize > 2 && msize > 2){
            //Se itera la solución del padre y la madre hasta encontrar un cromosoma en comun (un punto a otro)
            for(i=1; i < fsize - 1; i++){
                for(j=1; j < msize - 1; j++){
                    splice = father.getChroms().get(i).equals(mother.getChroms().get(j));
                    if(splice){
                        //Se parte el padre y la madre a la mitad en el cromosoma en común
                        //El primer hijo es mitad padre y mitad madre, con el vehículo del padre
                        //El segundo hijo es mitad madre y mitad padre, con el vehículo de la madre
                        child1.getChroms().addAll(father.getChroms().subList(0, i));
                        child1.getChroms().addAll(mother.getChroms().subList(j, msize));
                        child1.setiVehicle(father.getiVehicle());
                        child2.getChroms().addAll(mother.getChroms().subList(0, j));
                        child2.getChroms().addAll(father.getChroms().subList(i, fsize));
                        child1.setiVehicle(father.getiVehicle());
                        children.add(child1);
                        children.add(child2);
                        break;
                    }
                }
                if(splice){ //Si se encontró un corte, parar
                    break;
                }
            }
        }
        //Si no se encontró ningún punto de corte, los nuevos hijos serán la padre y la madre
        if(children.size() == 0){
            children.add(father);
            children.add(mother);
        }
        return children;
    }
    //Obtener un índice diferente a cero o el último
    public static int rollValidIndex(int cap){
        Random rand = new Random();
        int i = 0;
        while (i == 0) {
            i = rand.nextInt(cap - 1);
        }
        return i;
    }
    //endregion

}
